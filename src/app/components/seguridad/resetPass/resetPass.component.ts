import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CredencialesUserModel } from 'src/app/models/credenciales.user';
import { SeguridadService } from 'src/app/services/seguridad.service';
import { MD5 } from 'crypto-js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resetPass',
  templateUrl: './resetPass.component.html',
  styleUrls: ['./resetPass.component.css']
})

export class ResetPassComponent implements OnInit {

  formularioRecovery: FormGroup=new FormGroup({});

  constructor(
    private formBuilder: FormBuilder,
    private serviceSecurity:SeguridadService,
    private router:Router

  ) { }

  ngOnInit() {
    this.ConstruccionFormulario();
    this.capturarUser();
  }

  PasswordRecovery(){
    if(this.formularioRecovery.invalid){
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: `Documento de identidad no valido !!`,
        text: `Revisa cuidadosamente los datos...`,
        showConfirmButton: true,
        confirmButtonText: 'Entendido'
      });
     }else{
      let idUsuario =this.formularioRecovery.controls['user'].value;
      console.log(idUsuario);
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: `Se ha enviado el correo con la nueva clave !!`,
        text: `Revisa tu correo de nómina , ahí encontraras la nueva clave...`,
        showConfirmButton: true,
        confirmButtonText: 'Entendido'
      });
      this.serviceSecurity.passwordRecoveryService(idUsuario).subscribe({
         next: (data:any)=>console.log('nueva Clave:',data),
         error:(e)=>console.log(e)
      });
    }
  } //FIN de PasswordRecovery

  ConstruccionFormulario(){
    this.formularioRecovery=this.formBuilder.group({
        user:["",[Validators.required,Validators.minLength(3)]],
        currentPassword:["",[Validators.required, Validators.minLength(4)]],
        // newPassword:["",[Validators.required, Validators.minLength(4)]],
        // confirmPassword:["",[Validators.required, Validators.minLength(4)]]

    });
}

capturarUser(){
  //Captura la información del usuario desde el sessionStorage 
  let datosActuales=sessionStorage.getItem("sesionIntranet");
  if(datosActuales){
      //console.log("leyó datos del localStorage")
      let datoSesionJson= JSON.parse(datosActuales);
      let datosLS= datoSesionJson.datos;
      //console.log("datosLS.nombre: " + datosLS.nombre);
      this.formularioRecovery.controls['user'].setValue(datosLS.nombre);
  }

}

ChangePassword(){
    if(this.formularioRecovery.invalid){
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: `Usuario o clave de confirmación incorrecta !!`,
        showConfirmButton: true,
        confirmButtonText: 'Entendido'
      });
    }else{
      let datos = new CredencialesUserModel();
      datos.usuario=this.formularioRecovery.controls['user'].value;
      datos.password = MD5(this.formularioRecovery.controls['currentPassword'].value).toString();
      // datos.newPassword = MD5(this.formularioRecovery.controls['newPassword'].value).toString();
      // datos.confPassword = MD5(this.formularioRecovery.controls['confirmPassword'].value).toString();
      this.serviceSecurity.ChangePasswordService(datos).subscribe({
        next: (data)=>{
          //console.log(data);
          if(data == true){
            this.PasswordRecovery();
            this.router.navigate(['/login']);
            }else{
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: `Clave errada , por favor revisar !!`,
                showConfirmButton: true,
                confirmButtonText: 'Entendido'
              });
              this.router.navigate(['home']);
          }
        },
        error:(e)=> console.log(e)
        });
     this.router.navigate(['home']);
    }
}
}
