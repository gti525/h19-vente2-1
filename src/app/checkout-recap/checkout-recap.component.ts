import { Component, OnInit } from '@angular/core';
import { SPECTACLES } from '../mock/mock-spectacles';

import { CheckoutPassService } from "../services/checkout-pass.service"
import { CreditCard } from "../models/credit-card";
import { User } from "../models/user";
import { ShowCart, Cart } from '../models/cart';
import { LoginSocialService } from '../services/login-social.service';
import { Ticket } from '../models/ticket';
import { Router } from '@angular/router';
import { Event } from '../models/event';
import { CartService } from '../cart.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-checkout-recap',
  templateUrl: './checkout-recap.component.html',
  styleUrls: ['./checkout-recap.component.css']
})
export class CheckoutRecapComponent implements OnInit {


  spectacles = SPECTACLES;
  user: User;
  creditCard: CreditCard;
  userSocial;
  cart: Cart;
  showCart: ShowCart;
  total: number;

  constructor(
    public checkoutPassService: CheckoutPassService,
    private loginSocialService: LoginSocialService,
    private cartService: CartService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.user = this.checkoutPassService.user;
    this.creditCard = this.checkoutPassService.creditCard;
    this.showCart = this.checkoutPassService.showCart;
    this.cart = this.checkoutPassService.cart;
    this.calculateTotal();
  }

  calculateTotal() {
    this.total = 0;

    for (let i = 0; i < this.cart.tickets.length; i++) {
      this.total += Number(this.cart.tickets[i].price);
    }
  }

  onConfirm() {
    console.log("onConfirm");

    this.spinner.show();
    //commit transaction in our DB
    var message = "";
    
    this.checkoutPassService.commitTransaction()
      .then(res => {
        console.log("response from commit to passerelle : ", res);
        this.checkoutPassService.commitTransactionToOurAPI()
          .then(res => {
            console.log("response from commit to our API: ", res);
            message += this.postTicketToSocial();
            try {
              this.cartService.cartExpire()
                .subscribe(data => {
                  if (!("error" in data)) {
                    this.spinner.hide();
                    console.log("deleted cart", data);
                    this.endTransaction(message)
                  } else {
                    this.endTransaction(message)
                    console.log("could not delete cart", data);
                  }
                });
            }
            catch{

              this.endTransaction(message)
              console.log("err biggy");
            }
          })
          .catch(err => {
            message += err;
            this.endTransaction(message)
            console.log("error from commit to our API: ", err);
          });

      })
      .catch(err => {
        message += err;
        this.endTransaction(message)
        console.log("error from commit to passerelle: ", err);
      });

    
  }

  postTicketToSocial() {
    var message = '';
    //si l'utilisateur s'est login par social.
    if (this.checkoutPassService.getUserSocial()) {
      for (let ticket of this.cart.tickets) {

        var eventReceived: Event;
        this.spinner.show();
        this.loginSocialService.getEvent(ticket)
          .then(res => {
            console.log("Our Api sent this event: ", res);
            eventReceived = res.data;

            this.loginSocialService.postTicket(ticket,
              eventReceived,
              this.checkoutPassService.getUserSocial())
              .then(res => {
                console.log("Saucial says its all good : ", res);
              })
              .catch(err => {
                message += err;

                console.log("Error in post ticket to social :", err.response);
                return message;
              });
            this.spinner.hide();

          })
          .catch(err => {
            message += err;
            console.log("Error in get event :", err.response);
            return message;
          });
      }
    }
    else {
      console.log("its not a saucial : ", this.checkoutPassService.getUserSocial());
    }
  }

  endTransaction(message) {
    this.spinner.hide();
    this.router.navigate(["checkout-confirmation"]);
    this.checkoutPassService.notifiyCheckoutConfirmationComponent(message);
  }

}
