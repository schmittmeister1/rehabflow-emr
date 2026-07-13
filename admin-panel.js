// Admin Panel Component for RehabFlow EMR
// Provides user management for admin users

window.AdminPanel = function AdminPanel(props) {
  var user = props.user;
  var useState = React.useState;
  var useEffect = React.useEffect;

    function getName(u) { var n = u.full_name; if (!n) return ""; if (typeof n === "object") return n.full_name || ""; if (typeof n === "string" && n.charAt(0) === "{") { try { return JSON.parse(n).full_name || n; } catch(e) { return n; } } return n; }

  var _users = useState([]);
  var users = _users[0]; var setUsers = _users[1];
  var _loading = useState(true);
  var loading = _loading[0]; var setLoading = _loading[1];
  var _showCreate = useState(false);
  var showCreate = _showCreate[0]; var setShowCreate = _showCreate[1];
  var _message = useState("");
  var message = _message[0]; var setMessage = _message[1];
  var _creating = useState(false);
  var creating = _creating[0]; var setCreating = _creating[1];
  var _form = useState({email:"",password:"",fullName:"",role:"student",credentials:""});
  var form = _form[0]; var setForm = _form[1];

  useEffect(function() { loadUsers(); }, []);

  function loadUsers() {
    setLoading(true);
    window.RehabFlowDB.getAllUsers().then(function(result) {
      if (result.data) setUsers(result.data);
      setLoading(false);
    });
  }

  function handleCreate() {
    setCreating(true);
    setMessage("");
      window.RehabFlowDB.createUser(form.email, form.password, form.fullName, form.role, form.credentials).then(function(result) {
      if (result.error) {
        setMessage("Error: " + result.error.message);
      } else {
        setMessage("User created successfully!");
        setForm({email:"",password:"",fullName:"",role:"student",credentials:""});
        setShowCreate(false);
        loadUsers();
      }
      setCreating(false);
    });
  }

  function handleRoleChange(userId, newRole) {
    window.RehabFlowDB.updateUserRole(userId, newRole).then(function(result) {
      if (result.error) setMessage("Error: " + result.error.message);
      else loadUsers();
    });
  }

  function handleDeactivate(userId) {
    if (!confirm("Deactivate this user?")) return;
    window.RehabFlowDB.deactivateUser(userId).then(function(result) {
      if (result.error) setMessage("Error: " + result.error.message);
      else { setMessage("User deactivated"); loadUsers(); }
    });
  }

  var cellStyle = {padding:"12px 15px"};
  var headStyle = {padding:"12px 15px",textAlign:"left",fontWeight:600,fontSize:"12px",textTransform:"uppercase",borderBottom:"2px solid #e2e8f0"};
  var labelStyle = {display:"block",fontWeight:600,marginBottom:"4px",fontSize:"12px",textTransform:"uppercase"};
  var inputStyle = {width:"100%",padding:"8px 12px",border:"1px solid #cbd5e0",borderRadius:"6px",boxSizing:"border-box"};

  return React.createElement("div", {style:{padding:"20px"}},
    React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}},
      React.createElement("h2", {style:{margin:0}}, "User Management"),
      React.createElement("button", {className:"btn btn-primary",onClick:function(){setShowCreate(!showCreate)}}, showCreate ? "Cancel" : "+ Create User")
    ),

    message ? React.createElement("div", {style:{padding:"10px 15px",marginBottom:"15px",borderRadius:"6px",background:message.indexOf("Error")===0?"#fde8e8":"#e8fde8",color:message.indexOf("Error")===0?"#c53030":"#276749"}}, message) : null,

    showCreate ? React.createElement("div", {style:{background:"#fff",border:"1px solid #e2e8f0",borderRadius:"8px",padding:"20px",marginBottom:"20px"}},
      React.createElement("h3", {style:{marginTop:0}}, "Create New User"),
      React.createElement("div", {style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"15px"}},
        React.createElement("div", null,
          React.createElement("label", {style:labelStyle}, "Full Name"),
          React.createElement("input", {type:"text",value:form.fullName,onChange:function(e){setForm(Object.assign({},form,{fullName:e.target.value}))},style:inputStyle,placeholder:"John Smith"})
        ),
        React.createElement("div", null,
          React.createElement("label", {style:labelStyle}, "Email"),
          React.createElement("input", {type:"email",value:form.email,onChange:function(e){setForm(Object.assign({},form,{email:e.target.value}))},style:inputStyle,placeholder:"user@example.com"})
        ),
        React.createElement("div", null,
          React.createElement("label", {style:labelStyle}, "Password"),
          React.createElement("input", {type:"password",value:form.password,onChange:function(e){setForm(Object.assign({},form,{password:e.target.value}))},style:inputStyle,placeholder:"Min 6 characters"})
        ),
        React.createElement("div", null,
          React.createElement("label", {style:labelStyle}, "Role"),
          React.createElement("select", {value:form.role,onChange:function(e){setForm(Object.assign({},form,{role:e.target.value}))},style:inputStyle},
            React.createElement("option", {value:"student"}, "Student"),
            React.createElement("option", {value:"admin"}, "Admin")
          )
        ),
        React.createElement("div", null,
          React.createElement("label", {style:labelStyle}, "Credentials"),
          React.createElement("input", {type:"text",value:form.credentials,onChange:function(e){setForm(Object.assign({},form,{credentials:e.target.value}))},style:inputStyle,placeholder:"SPT, PT, DPT, etc."})
        )
      ),
      React.createElement("button", {className:"btn btn-primary",style:{marginTop:"15px"},onClick:handleCreate,disabled:creating||!form.email||!form.password||!form.fullName}, creating ? "Creating..." : "Create User")
    ) : null,

    loading ? React.createElement("div", null, "Loading users...") :
    React.createElement("div", {style:{background:"#fff",border:"1px solid #e2e8f0",borderRadius:"8px",overflow:"hidden"}},
      React.createElement("table", {style:{width:"100%",borderCollapse:"collapse"}},
        React.createElement("thead", null,
          React.createElement("tr", {style:{background:"#f7fafc"}},
            React.createElement("th", {style:headStyle}, "Name"),
            React.createElement("th", {style:headStyle}, "Email"),
            React.createElement("th", {style:headStyle}, "Role"),
            React.createElement("th", {style:headStyle}, "Credentials"),
            React.createElement("th", {style:headStyle}, "Actions")
          )
        ),
        React.createElement("tbody", null,
          users.map(function(u) {
            return React.createElement("tr", {key:u.id,style:{borderBottom:"1px solid #e2e8f0"}},
              React.createElement("td", {style:cellStyle}, getName(u)),
              React.createElement("td", {style:cellStyle}, u.email || "\u2014"),
              React.createElement("td", {style:cellStyle},
                React.createElement("select", {value:u.role,onChange:function(e){handleRoleChange(u.id,e.target.value)},style:{padding:"4px 8px",border:"1px solid #cbd5e0",borderRadius:"4px"}},
                  React.createElement("option", {value:"student"}, "Student"),
                  React.createElement("option", {value:"admin"}, "Admin")
                )
              ),
              React.createElement("td", {style:cellStyle}, u.credentials || "\u2014"),
              React.createElement("td", {style:cellStyle},
                React.createElement("button", {onClick:function(){handleDeactivate(u.id)},style:{padding:"4px 10px",background:"#fed7d7",color:"#c53030",border:"none",borderRadius:"4px",cursor:"pointer",fontSize:"12px"}}, "Deactivate")
              )
            );
          })
        )
      )
    )
  );
};
