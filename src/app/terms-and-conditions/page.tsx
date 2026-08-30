import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms and Conditions | Guidewala" };

export default function TermsAndConditionsPage() {
  return (
    <LegalPage title="Terms and Conditions" crumb="Terms and Conditions">
      <p className="text-center italic font-medium">
        Please read these Terms and Conditions of Use (&ldquo;User Agreement&rdquo;) very carefully.
      </p>

      <h3>Payment Policy</h3>
      <p>
        All payments to Guidewala are non-refundable. Guide payment is totally not refundable,
        however we may review it according to situation.
      </p>

      <h3>Cancellation &amp; Refunds</h3>
      <p>
        Customer can cancel the order within 24 hrs from the date of confirmation of the order. We
        may make a refund according to situation.
      </p>
      <p>
        If the guide doesn&apos;t contact you as per the booking, please contact us immediately — we
        will pursue the case with the necessary actions.
      </p>

      <h3>Terms and Condition of Sale (Services)</h3>
      <p>
        The customer agrees to be bound by this sale agreement and accepts its terms and conditions
        (unless the customer has signed a separate formal purchase agreement with Guidewala, in
        which case the separate agreement shall govern).
      </p>

      <h3>Important Information About This Legal Contract</h3>
      <p>
        This Sale Agreement is a legal contract between the Customer and Guidewala. The Customer
        accepts this Sale Agreement by making a booking on the Site. The terms and conditions of
        this Sale Agreement are subject to change without prior notice, except that the terms and
        conditions posted on the Site at the time the Customer initially places or modifies an order
        will govern the order in question.
      </p>
      <p>
        This Sale Agreement constitutes the entire agreement between the Customer and Guidewala
        relating to the purchase or sale of goods or services on the Site. The Sale Agreement may
        only be modified or terminated with regard to goods or services that have been purchased or
        sold on the Site in a writing signed by Guidewala.
      </p>
      <p>
        In the event of any conflict between the terms and conditions stated on your purchase order
        and this Sale Agreement or any terms and conditions on our invoice, you agree that the
        provisions of this Sale Agreement and our invoice shall control.
      </p>

      <h3>Governing Law</h3>
      <p>
        This Agreement and any sales hereunder shall be governed by the laws of the State of
        Rajasthan, without regard to conflicts of laws rules. The customer consents to the
        jurisdiction of the federal or state courts located in Jaipur, Rajasthan for purposes of any
        suit, action or proceeding arising out of this Sale Agreement.
      </p>

      <h3>Definitions</h3>
      <p>
        In this document the following words shall have the following meanings:
        <br />
        &ldquo;Seller&rdquo; means Guidewala, Jaipur (Raj.) India
        <br />
        &ldquo;Buyer&rdquo; means the person who takes services from Guidewala
        <br />
        &ldquo;Goods&rdquo; means the articles that the Buyer agrees to buy from Guidewala
        <br />
        &ldquo;List Price&rdquo; means the list of prices of the Services/Goods maintained by
        Guidewala as amended from time to time
        <br />
        &ldquo;Terms and Conditions&rdquo; means the terms and conditions of sale set out in this
        document and any special terms and conditions agreed in writing by Guidewala
      </p>

      <h3>General</h3>
      <p>
        These Terms and Conditions shall apply to all contracts for the sale of Services/Goods by the
        Seller to the Buyer and shall prevail over any other documentation or communication from the
        Buyer.
      </p>
      <p>
        All orders for Services/Goods shall be deemed to be an offer by the Buyer to purchase
        Services/Goods pursuant to these Terms and Conditions and are subject to acceptance by the
        Seller. The Seller may choose not to accept an order for any reason.
      </p>
      <p>Acceptance of delivery of the Services/Goods shall be deemed conclusive evidence of the Buyer&apos;s acceptance of these Terms and Conditions.</p>
      <p>Any variation to these Terms and Conditions shall be inapplicable unless agreed in writing by the Seller.</p>
      <p>Nothing in these Terms and Conditions shall affect the Buyer&apos;s statutory rights as a Consumer.</p>

      <h3>Pricing and Information Disclaimer</h3>
      <p>
        All pricing subject to change. For all prices, products and offers, Guidewala reserves the
        right to make adjustments due to changing market conditions, product discontinuation,
        manufacturer price changes, errors in advertisements and other extenuating circumstances.
      </p>
      <p>
        While Guidewala uses reasonable efforts to include accurate and up-to-date information on
        the Site, Guidewala makes no warranties or representations as to the Site&apos;s accuracy.
        Guidewala assumes no liability or responsibility for any errors or omissions in the content
        on the Site.
      </p>

      <h3>Limitation of Liability</h3>
      <p>
        Guidewala will not be liable for lost profits, loss of business or other consequential,
        special, indirect, or punitive damages, even if advised of the possibility of such damages,
        or for any claim by any third party except as expressly provided herein. Customer agrees
        that for any liability related to the purchase of products or services, Guidewala is not
        liable or responsible for any amount of damages above the aggregate dollar amount paid by
        Customer for the purchase(s) under this Agreement.
      </p>

      <h3>Arbitration</h3>
      <p>
        Any claim, dispute, or controversy arising from or relating to this Sale Agreement, its
        interpretation, or the breach, termination or validity thereof shall be resolved exclusively
        and finally by a sole arbitrator in accordance with the provision of the Indian Arbitration
        and Conciliation Act, 1996. The place of arbitration shall be Jaipur, and proceedings shall
        be in English.
      </p>
      <p>
        Judgment on the award rendered by the arbitrator(s) may be entered by any court having
        jurisdiction. Each party shall bear its own cost of any legal representation, discovery, or
        research required to complete arbitration.
      </p>

      <h3>Orders; Payment Terms; Interest; Taxes</h3>
      <p>
        Orders are not binding upon Guidewala until accepted by Guidewala. Terms of payment are
        within Guidewala&apos;s sole discretion. Invoices are due and payable within the time period
        noted on the invoice, measured from the date of the invoice. Customer agrees to pay interest
        on all past-due sums at the highest rate allowed by law. The Customer is responsible for
        sales and all other taxes associated with the order.
      </p>
    </LegalPage>
  );
}
