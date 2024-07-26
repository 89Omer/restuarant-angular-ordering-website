import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.scss']
})
export class LoginPopupComponent implements OnInit {

  constructor(public modal: NgbActiveModal, private router: Router) { }

  ngOnInit(): void {
  }

  onLoginClick() {
    this.router.navigate(['/auth/login']);
    this.modal.close();
  }

}
