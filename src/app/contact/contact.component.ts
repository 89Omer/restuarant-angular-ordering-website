import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    // Initialization logic can go here
  }

  onSubmit() {
    if (this.contactForm.valid) {
      alert('Form submitted with data: ' + JSON.stringify(this.contactForm.value));
      this.contactForm.reset();
    }
  }
}

