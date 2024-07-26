import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiElementsService {
  private isLoading: boolean = false;
  private totalSteps: number = 0;
  private currentStep: number = 0;
  private spinner: any; // Store spinner instance

  // Observable for loading status
  loadingStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Observable for percentage
  percentage: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private toastController: ToastrService, private loadingController: NgxSpinnerService) { }

  presentToast(body: string, position?: string, duration?: number) {
    this.toastController.show(body)
  }

  presentSuccessToast(msg: string) {
    this.toastController.success(msg);
  }

  presentErrorAlert(msg: string, headingText?: string, actionText?: string) {
    this.toastController.error(msg);
  }

  async presentLoading(body: string) {
    this.isLoading = true;
    this.loadingStatus.next(true);

    const spinner = await this.loadingController.show();

    // Reset current step
    this.currentStep = 0;

    // Simulate your operation here
    const totalSteps = this.totalSteps || 1; // Default to 1 if totalSteps is not provided
    for (this.currentStep = 0; this.currentStep < totalSteps; this.currentStep++) {

      // Updates percentage based on progress
      const currentPercentage = ((this.currentStep + 1) / totalSteps) * 100;
      this.updatePercentage(currentPercentage);
    }

    // All steps are completed
    this.isLoading = false;
    this.loadingStatus.next(false);
    this.dismissLoading(); // Pass the spinner instance to dismissLoading method
  }

  async dismissLoading() {
    // Wait for the content to load before dismissing the spinner
    await this.delay(2000);

    // Dismiss the spinner
    try {
      await this.loadingController.hide(this.spinner);
    } catch (error) {
      console.log(error);
    }
  }

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getLoadingStatus(): BehaviorSubject<boolean> {
    return this.loadingStatus;
  }

  setTotalSteps(totalSteps: number) {
    this.totalSteps = totalSteps;
  }

  // Function to update percentage value
  updatePercentage(value: number) {
    // Emit percentage value
    this.percentage.next(value);
  }

  // Function to reset percentage value
  resetPercentage() {
    // Emit percentage value
    this.percentage.next(0);
  }
}
