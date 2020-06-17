import { Crypt } from 'hybrid-crypto-js';
import React, {Component} from 'react';
import './App.css';
import axios from 'axios';;

var publicKey = "";
var privateKey = "";
class App extends Component{
  constructor(props){
    super(props);
    this.state = {  
      file: null, 
      base64:""
    };
    this.onChange = this.onChange.bind(this);
    this.checkAnyError = this.checkAnyError.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.validateField = this.validateField.bind(this);
    this.isEmpty = this.isEmpty.bind(this);
    this.regExObj={
      name: '^[a-zA-Z ]*$',
      email: '^[A-Z0-9a-z\\.\\_\\%\\+\\-\]+\\@[A-Za-z0-9\\.\\-]+\\.[A-Za-z]{2,6}$',
      phone: '^(\\d{10})?$'
    }
  }

  componentDidMount = () => {
    axios.get("http://localhost:9000/testAPI")
      .then(function(res){
        publicKey = res.data["public-key"];
        privateKey = res.data["private-key"];
        console.log("public-key..", publicKey, privateKey);
      });
  }

  onChange(e) {
    e.preventDefault();
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.setState({
        file: file,
        base64: reader.result
      });
    };
  }

  validateField(evt) {
    if(!this.isEmpty(evt)){
      var pattern = new RegExp(this.regExObj[evt.target.id]);
      if (pattern.test(evt.target.value)) {
        evt.target.nextElementSibling.style.visibility = 'hidden';
        return true;
      } else {
        evt.target.nextElementSibling.style.visibility = 'visible';
        evt.target.nextElementSibling.innerHTML = "Validation Error";
        return false;
      }
    }
  }

  isEmpty(evt){
    if(evt.target.value !== ""){
      evt.target.nextElementSibling.style.visibility = 'hidden';
      return false;
    }else{
      evt.target.nextElementSibling.style.visibility = 'visible';
      evt.target.nextElementSibling.innerHTML = evt.target.getAttribute('data') + " is required";
      return true;
    }
  }

  formSubmit() {
    var payload = {};
    if (!this.checkAnyError()) {
      if (!this.state.file === null) {
        alert("please upload a photo");
        return;
      } else {
        payload = {
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          photo: this.state.base64,
          phone: document.getElementById("phone").value,
          description: document.getElementById("desc").value
        }
        // Basic initialization
        var crypt = new Crypt();


        // Increase amount of entropy
        var entropy = 'Random string, integer or float';
        var crypt = new Crypt({ entropy: entropy });
        
        // Encryption with one public RSA key
        var encrypted = crypt.encrypt(publicKey, JSON.stringify(payload));

        // var decrypted = crypt.decrypt(privateKey, encrypted);
        // console.log("sfdsf", decrypted.message)
      
        var data = {
          "payload": encrypted.toString()
        };
        // const formData = new FormData()
        // formData.append(
        //   'myFile',
        //   this.state.file,
        //   this.state.file.name
        // )
        const config = {
          headers: {
            'Content-Type': 'multipart/encrypted',
            'Accept': 'multipart/encrypted',
            'Access-Control-Allow-Origin': 'http://localhost:9000/upload'
          }
        };
        

        axios.post("http://localhost:9000/testAPI", data)
          .then(res => console.log(res))
          .catch(error => console.log(error)); 
          }
      }
  }

  checkAnyError() {
    var isError = false;
    [...document.getElementsByClassName("imp")].forEach(function(item, index) {
      if (item.value === "") {
        item.nextElementSibling.style.visibility = "visible";
        item.nextElementSibling.innerHTML = item.getAttribute('name') + " is required";
        isError = true;
      }
    });
    return isError;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2>My Form</h2>
        </header>
        <div className='App-body' id="content">
          <p>
            <label>Name<span>:</span></label>
          <input className='imp' id="name" type='text' name='Name' onBlur={this.validateField} />
            <span className='capture_tip_error'></span>
          </p>
          <p>
            <label>Email<span>:</span></label>
          <input className='imp' id="email" type='text' name='Email' onBlur={this.validateField} />
            <span className='capture_tip_error'></span>
          </p>
          <p>
            <label>Phone Number<span>:</span></label>
          <input className='imp' id="phone" maxLength='10' type='text' name='Phone Number' onBlur={this.validateField} />
            <span className='capture_tip_error'></span>
          </p>
          <p>
            <label>Photo<span>:</span></label>
            <input type="file" name="Photo" onChange={this.onChange} />
          </p>
          <p>
            <label>Description<span>:</span></label>
            <textarea id="desc"></textarea>
          </p>
          <button onClick={this.formSubmit}>Submit</button>
        </div>
      </div>
    );
  }
}

export default App;
