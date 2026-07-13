/**
 * RehabFlow EMR - Supabase Client Integration
 *
 * Provides window.RehabFlowDB: a global object with methods for
 * authentication, patient management, clinical notes, admin operations,
 * and audit logging against a Supabase backend.
 *
 * Load this file as a regular <script> tag (NOT type="text/babel")
 * BEFORE the main app.js. It depends on the Supabase JS SDK loaded
 * from CDN prior to this script.
 *
 * Required script order in index.html:
 *   1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   2. <script src="supabase-client.js"></script>
 *   3. <script type="text/babel" src="app.js"></script>
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  var SUPABASE_URL = 'https://pjqgymetznksirccapox.supabase.co';
  var SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcWd5bWV0em5rc2lyY2NhcG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTQxMjEsImV4cCI6MjA5OTUzMDEyMX0.ve6Kx7jKGbU6GNJrfdGTzBcLHFP51EGSuBwioqSAuHc';

  // ---------------------------------------------------------------------------
  // Supabase client singleton
  // ---------------------------------------------------------------------------

  if (typeof supabase === 'undefined' || !supabase.createClient) {
    console.error(
      '[RehabFlowDB] Supabase JS SDK not found. ' +
        'Make sure <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> ' +
        'is loaded before supabase-client.js.'
    );
    return;
  }

  var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Wrap a Supabase response so every public method returns a consistent
   * { data, error } shape. If the call throws, the exception is caught and
   * returned as an error object.
   */
  function safe(promise) {
    return promise
      .then(function (result) {
        if (result.error) {
          return { data: null, error: result.error };
        }
        return { data: result.data, error: null };
      })
      .catch(function (err) {
        return { data: null, error: { message: err.message || String(err) } };
      });
  }

  // ---------------------------------------------------------------------------
  // Key mapping: camelCase <-> snake_case
  // ---------------------------------------------------------------------------

  function toSnakeCase(str) {
    return str
      .replace(/([a-z\d])([A-Z])/g, '$1_$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .toLowerCase();
  }

  function toCamelCase(str) {
    var result = str.replace(/_([a-z])/g, function (_, letter) { return letter.toUpperCase(); });
    // Fix known abbreviations that get lowercased
    return result.replace(/Odi$/g, 'ODI').replace(/Md$/g, 'MD');
  }

  function mapKeysToSnake(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    var result = {};
    Object.keys(obj).forEach(function (key) {
      result[toSnakeCase(key)] = obj[key];
    });
    return result;
  }

  function mapKeysToCamel(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    var result = {};
    Object.keys(obj).forEach(function (key) {
      result[toCamelCase(key)] = obj[key];
    });
    return result;
  }

  // Fields that exist in JS but not in the DB schema
  var JS_ONLY_FIELDS = ['noteHistory'];

  function patientToDb(patient) {
    var dbObj = {};
    Object.keys(patient).forEach(function (key) {
      if (JS_ONLY_FIELDS.indexOf(key) === -1) {
        dbObj[toSnakeCase(key)] = patient[key];
      }
    });
    return dbObj;
  }

  function patientFromDb(row) {
    return mapKeysToCamel(row);
  }

  // =========================================================================
  //  AUTH METHODS
  // =========================================================================

  /**
   * Sign in with email and password.
   * Returns { user, profile, error }.
   */
  async function signIn(email, password) {
    try {
      var authResult = await sb.auth.signInWithPassword({ email: email, password: password });

      if (authResult.error) {
        return { user: null, profile: null, error: authResult.error };
      }

      var user = authResult.data.user;

      // Fetch the user's profile from the profiles table.
      var profileResult = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        user: user,
        profile: profileResult.data || null,
        error: profileResult.error || null,
      };
    } catch (err) {
      return { user: null, profile: null, error: { message: err.message } };
    }
  }

  /**
   * Sign out the current user.
   */
  async function signOut() {
    return safe(sb.auth.signOut());
  }

  /**
   * Get the current session (access token, user, etc.).
   */
  async function getSession() {
    return safe(sb.auth.getSession());
  }

  /**
   * Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, etc.).
   * Returns the subscription object so the caller can unsubscribe.
   */
  function onAuthChange(callback) {
    var result = sb.auth.onAuthStateChange(function (event, session) {
      callback(event, session);
    });
    return result.data.subscription;
  }

  /**
   * Get the current authenticated user's profile row.
   */
  async function getProfile() {
    try {
      var sessionResult = await sb.auth.getSession();
      if (sessionResult.error || !sessionResult.data.session) {
        return { data: null, error: sessionResult.error || { message: 'No active session' } };
      }

      var userId = sessionResult.data.session.user.id;
      var result = await sb.from('profiles').select('*').eq('id', userId).single();

      return { data: result.data, error: result.error };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }

  /**
   * Admin creates a new user account.
   *
   * Strategy: save the admin's current session, call signUp (which may
   * auto-confirm and create a new session), then immediately restore
   * the admin's original session so the admin stays logged in.
   *
   * The database trigger (handle_new_user) creates the profile row
   * from the user_metadata passed here.
   */
  async function createUser(email, password, fullName, role, credentials) {
    try {
      // 1. Capture the admin's current session tokens.
      var currentSession = await sb.auth.getSession();
      if (currentSession.error || !currentSession.data.session) {
        return { data: null, error: { message: 'Admin must be signed in to create users' } };
      }
      var adminAccessToken = currentSession.data.session.access_token;
      var adminRefreshToken = currentSession.data.session.refresh_token;

      // 2. Sign up the new user with metadata.
      var signUpResult = await sb.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            credentials: credentials,
          },
        },
      });

      if (signUpResult.error) {
        return { data: null, error: signUpResult.error };
      }

      var newUser = signUpResult.data.user;

      // 3. Restore the admin's session so the admin remains logged in.
      await sb.auth.setSession({
        access_token: adminAccessToken,
        refresh_token: adminRefreshToken,
      });

      return { data: newUser, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }

  // =========================================================================
  //  PATIENT METHODS
  // =========================================================================

  /**
   * Fetch all patients, ordered by last name.
   */
  async function getPatients() {
    var result = await safe(
      sb.from('patients').select('*').order('last_name', { ascending: true })
    );
    if (result.data) {
      result.data = result.data.map(patientFromDb);
    }
    return result;
  }

  /**
   * Fetch a single patient by ID.
   */
  async function getPatient(id) {
    var result = await safe(sb.from('patients').select('*').eq('id', id).single());
    if (result.data) {
      result.data = patientFromDb(result.data);
    }
    return result;
  }

  /**
   * Update fields on an existing patient.
   */
  async function updatePatient(id, data) {
    var dbData = mapKeysToSnake(data);
    var result = await safe(
      sb
        .from('patients')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()
    );
    if (result.data) {
      result.data = patientFromDb(result.data);
    }
    return result;
  }

  /**
   * Insert a new patient record.
   */
  async function createPatient(data) {
    var dbData = patientToDb(data);
    var result = await safe(sb.from('patients').insert(dbData).select().single());
    if (result.data) {
      result.data = patientFromDb(result.data);
    }
    return result;
  }

  /**
   * Bulk-insert an array of patient objects (for initial seeding).
   * Returns the inserted rows.
   */
  async function seedPatients(patientsArray) {
    if (!Array.isArray(patientsArray) || patientsArray.length === 0) {
      return { data: [], error: null };
    }
    var dbArray = patientsArray.map(patientToDb);
    var result = await safe(sb.from('patients').insert(dbArray).select());
    if (result.data) {
      result.data = result.data.map(patientFromDb);
    }
    return result;
  }

  // =========================================================================
  //  NOTE METHODS
  // =========================================================================

  /**
   * Get all notes for a patient authored by the current user,
   * ordered newest first.
   */
  async function getNotes(patientId) {
    try {
      var sessionResult = await sb.auth.getSession();
      if (sessionResult.error || !sessionResult.data.session) {
        return { data: null, error: { message: 'No active session' } };
      }
      var userId = sessionResult.data.session.user.id;

      return safe(
        sb
          .from('notes')
          .select('*')
          .eq('patient_id', patientId)
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
      );
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }

  /**
   * Admin: get ALL notes for a patient regardless of author.
   */
  async function getAllNotes(patientId) {
    return safe(
      sb
        .from('notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
    );
  }

  /**
   * Create a new note (initially a draft).
   */
  async function createNote(noteData) {
    return safe(sb.from('notes').insert(noteData).select().single());
  }

  /**
   * Update fields on a draft note.
   */
  async function updateNote(id, data) {
    return safe(
      sb.from('notes').update(data).eq('id', id).select().single()
    );
  }

  /**
   * Sign (finalize) a note. Sets the status to 'signed', records the
   * signer's name, credentials, and timestamp, and locks it from
   * further editing.
   */
  async function signNote(id, signerName, signerCredentials) {
    try {
      var sessionResult = await sb.auth.getSession();
      var userId = sessionResult.data && sessionResult.data.session
        ? sessionResult.data.session.user.id : null;

      return safe(
        sb
          .from('notes')
          .update({
            status: 'signed',
            signed_by: userId,
            signer_name: signerName,
            signer_credentials: signerCredentials,
            signed_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()
      );
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }

  /**
   * Admin co-signs a note. Records co-signer details without changing
   * the original signature.
   */
  async function coSignNote(id, coSignerName, coSignerCredentials) {
    try {
      var sessionResult = await sb.auth.getSession();
      var userId = sessionResult.data && sessionResult.data.session
        ? sessionResult.data.session.user.id : null;

      return safe(
        sb
          .from('notes')
          .update({
            status: 'co-signed',
            co_signed_by: userId,
            co_signer_name: coSignerName,
            co_signer_credentials: coSignerCredentials,
            co_signed_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()
      );
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }

  /**
   * Delete a draft note. Only drafts should be deletable; the RLS
   * policy on the backend enforces this.
   */
  async function deleteNote(id) {
    return safe(sb.from('notes').delete().eq('id', id));
  }

  // =========================================================================
  //  ADMIN METHODS
  // =========================================================================

  /**
   * Get all user profiles (admin use).
   */
  async function getAllUsers() {
    return safe(
      sb.from('profiles').select('*').order('full_name', { ascending: true })
    );
  }

  /**
   * Update a user's role.
   */
  async function updateUserRole(userId, role) {
    return safe(
      sb
        .from('profiles')
        .update({ role: role })
        .eq('id', userId)
        .select()
        .single()
    );
  }

  /**
   * Deactivate a user account by setting is_active to false.
   */
  async function deactivateUser(userId) {
    return safe(
      sb
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId)
        .select()
        .single()
    );
  }

  /**
   * Fetch recent audit log entries, newest first.
   */
  async function getAuditLog(limit) {
    var rowLimit = limit || 100;
    return safe(
      sb
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(rowLimit)
    );
  }

  // =========================================================================
  //  UTILITY
  // =========================================================================

  /**
   * Write an entry to the audit log.
   */
  async function logAudit(action, tableName, recordId, details) {
    try {
      var sessionResult = await sb.auth.getSession();
      var userId =
        sessionResult.data && sessionResult.data.session
          ? sessionResult.data.session.user.id
          : null;

      return safe(
        sb.from('audit_log').insert({
          user_id: userId,
          action: action,
          table_name: tableName,
          record_id: recordId,
          details: details || null,
        })
      );
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }

  // =========================================================================
  //  PUBLIC API
  // =========================================================================

  window.RehabFlowDB = {
    // Raw Supabase client (escape hatch for advanced queries)
    _supabase: sb,

    // Auth
    signIn: signIn,
    signOut: signOut,
    getSession: getSession,
    onAuthChange: onAuthChange,
    getProfile: getProfile,
    createUser: createUser,

    // Patients
    getPatients: getPatients,
    getPatient: getPatient,
    updatePatient: updatePatient,
    createPatient: createPatient,
    seedPatients: seedPatients,

    // Notes
    getNotes: getNotes,
    getAllNotes: getAllNotes,
    createNote: createNote,
    updateNote: updateNote,
    signNote: signNote,
    coSignNote: coSignNote,
    deleteNote: deleteNote,

    // Admin
    getAllUsers: getAllUsers,
    updateUserRole: updateUserRole,
    deactivateUser: deactivateUser,
    getAuditLog: getAuditLog,

    // Utility
    logAudit: logAudit,
  };

  console.log('[RehabFlowDB] Supabase client initialized and ready.');
})();
