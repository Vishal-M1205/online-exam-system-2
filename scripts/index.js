import {USER_API,DEP_API} from '../scripts/api.js';


// Regex for the validations
const nameRegex = /^[A-Za-z ]{3,}$/;
const emailRegex = /^[a-zA-z0-9-\.]+@[a-zA-z0-9-\.]+\.[a-zA-z0-9-\.]{2,}$/;

const mobileRegex = /^[0-9]{10}$/;

let signupValid = true;
let loginValid = true;

//Modal from the DOM
const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));


//toastr Configuration
toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }

const dobDate = new Date();

// Date Validation
dobDate.setFullYear(dobDate.getFullYear() - 17);
$('#dob').prop('max', dobDate.toISOString().split('T')[0]);


//Populating the select tag in the Signup Modal
function renderDepartment(data){
   const parent = document.getElementById('department');
   let html = "";
   data.forEach(d => {
      html += `
         <option value="${d.departmentName}" data-id="${d.deptId}">${d.departmentName}</option>
      `
   });
   parent.innerHTML = html;
}

async function getDepartment(){
    try {
        const response = await fetch(DEP_API);
       const data = await response.json();
       renderDepartment(data);
        
    } catch (error) {
        toastr.error(error.message)
    }
   

}

getDepartment();

// Validations for name, email, mobile no, password

$('#signup-form').validate({
    errorClass: 'text-danger d-block mt-1',
    rules:{
        name:{
            required:true,
            pattern: /^[a-zA-Z\s]{3,}$/
        },
        email:{
            email:true,
            required:true
        },
        pass:{
            required:true,
            pattern:/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@!#$%&*-_\.]).{8,15}$/
        },
        cpass:{
            required:true,
            equalTo: '#pass',
        },
        dob:{
            required:true
        },
        gender:{
            required:true
        },
        college:{
            required:true
        },
        department:{
            required:true
        },
        mobile:{
            required:true,
            maxlength:10,
            digits:true
        }
    },
   submitHandler:function(form){
     signup();
   }
})


$("#signModalBtn").on('submit',(e)=>{
    e.preventDefault();
})


// Validation for empty values and signup POST method

  async function signup(){

    try {
        const emailCheck = await fetch(`${USER_API}?email=${$('#email').val()}`)
    const emailResponse = await emailCheck.json(); 
    if(emailResponse[0]?.email){
        toastr.error('Email Already Exists')
    }
    else{
         const response  = await fetch(USER_API,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            name:$('#name').val().trim(),
            email:$('#email').val().trim().toLowerCase(),
            password:$('#pass').val().trim(),
            dob: $('#dob').val(),
            gender:$("#male").prop('checked')?"Male":"Female",
            college:$('#college').val().trim(),
            deptId: $('#department').data('id'),
            departmentName: $('#department').val(),
            mobile: $('#mobile').val(),
            role:"Student"
        })
    });
    
    if(response.ok){
        signupModal.hide();
        toastr.success('Registration Success');
    }
    }
    } catch (error) {
        toastr.error(error);
    }

  }
    
// Login Validation

$('#login-form').validate({
    errorClass: 'text-danger d-block mt-1',
    rules:{
        loginEmail:{
            required:true,
            email:true
        },
        loginPass:{
            required:true,
           
        },
    },
   submitHandler:function(form){
     login();
   }
})

$('#logModalBtn').on('submit',(e)=>{
    e.preventDefault();
})


async function login(){

    const response = await fetch(`${USER_API}?email=${$('#loginEmail').val()}`);
      const data = await response.json();
     if(!data[0]?.email){
        toastr.error('No user found');
     }
      else if(!(data[0].password == $('#loginPass').val())){
         toastr.error('Wrong Password');
      }
      else{
         toastr.success('Login Success');
         localStorage.setItem('user',JSON.stringify(data));
         if(data[0].role == "Admin"){
            setTimeout(()=>{
               window.location.replace('../pages/adminDash.html');
            },1000)
         }
         else{
            setTimeout(()=>{
               window.location.replace('../pages/studentDash.html');
            },1000) 
         }
      }

}

      