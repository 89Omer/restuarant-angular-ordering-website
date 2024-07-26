
export class CardInfo {
    name: string='';
    number: string='';
    expMonth: number=0;
    expYear: number=0;
    cvc: string='';

    areFieldsFilled() {
        return ((this.name && this.name.length)
            &&
            (this.number && this.number.length > 10)
            &&
            (this.expMonth && this.expMonth <= 12 && this.expMonth >= 1)
            &&
            (this.expYear && this.expYear <= 99)
            &&
            (this.cvc && this.cvc.length == 3));
    }

    static getSavedCard(): CardInfo {
        let cardInfo = new CardInfo();
        let savedCardInfo = JSON.parse(window.localStorage.getItem("card_info_saved") as string);
        if (savedCardInfo) {
            cardInfo.name = savedCardInfo.name;
            cardInfo.number = savedCardInfo.number;
            cardInfo.expMonth = savedCardInfo.expMonth;
            cardInfo.expYear = savedCardInfo.expYear;
        }
        return cardInfo;
    }

    static setSavedCard(cardInfo: CardInfo) {
        window.localStorage.setItem("card_info_saved", JSON.stringify(cardInfo));
    }
}
