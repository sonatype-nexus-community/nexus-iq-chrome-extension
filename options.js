window.onload = function(){
  console.log('here');
  document.getElementById('url').focus();
  document.getElementById('cancel').onclick=function(){
    var ok = true;
    if(ok){
      window.close();
    }
  }
  document.getElementById('save').onclick=function(){
      var url = document.getElementById('url').value;
      var username = document.getElementById('username').value;
      var password = document.getElementById('password').value;
      // console.log(url);
      // console.log(username);
      // console.log(password);
      
      //alert(value);
      chrome.storage.sync.set({'url':url}, function(){
          //alert('saved'+ value);
      });
      chrome.storage.sync.set({'username':username}, function(){
        //alert('saved'+ value);
      });
      chrome.storage.sync.set({'password':password}, function(){
        //alert('saved'+ value);
      });
      var ok = true;
      if(ok){
        alert('saved values');
        window.close();
      }

    
  }
  load_data();
}

function load_data(){
  console.log('load_data');
  chrome.storage.sync.get('url', function(data){
    if(typeof data.url !== "undefined"){
      document.getElementById("url").value = data.url;    
    }
    console.log(data.url);
  });
  chrome.storage.sync.get('username', function(data){
    if(typeof data.username !== "undefined"){
      document.getElementById("username").value = data.username;
    }
    console.log(data.username);

  })
  chrome.storage.sync.get('password', function(data){
    if(typeof data.password !== "undefined"){
      document.getElementById("password").value = data.password;
    }
    console.log(data.password);
  });
};