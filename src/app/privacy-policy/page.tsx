import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy | Guidewala" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" crumb="Privacy Policy">
      <h3>SECTION 1 – WHAT DO WE DO WITH YOUR INFORMATION?</h3>
      <p>
        When you purchase something from our store, as part of the buying and selling process, we
        collect the personal information you give us such as your name, address and email address.
        When you browse our store, we also automatically receive your computer&apos;s internet
        protocol (IP) address in order to provide us with information that helps us learn about your
        browser and operating system. Email marketing (if applicable): with your permission, we may
        send you emails about our store, new products and other updates.
      </p>

      <h3>SECTION 2 – CONSENT</h3>
      <h4>How do you get my consent?</h4>
      <p>
        When you provide us with personal information to complete a transaction, verify your credit
        card, place an order, arrange for a delivery or return a purchase, we imply that you consent
        to our collecting it and using it for that specific reason only. If we ask for your personal
        information for a secondary reason, like marketing, we will either ask you directly for your
        expressed consent, or provide you with an opportunity to say no. How do I withdraw my
        consent? If after you opt-in, you change your mind, you may withdraw your consent for us to
        contact you, for the continued collection, use or disclosure of your information, at any
        time, by contacting us at booking@guidewala.co.in.
      </p>

      <h3>SECTION 3 – DISCLOSURE</h3>
      <p>
        We may disclose your personal information if we are required by law to do so or if you
        violate our Terms of Service.
      </p>

      <h3>SECTION 4 – PAYMENTS</h3>
      <p>
        All payments made for the purchase by credit card and debit card through our payment gateway
        partners, all financial information is encrypted through the Payment Card Industry Data
        Security Standard (PCI-DSS). Your purchase transaction data is stored only as long as is
        necessary to complete your purchase transaction. After that is complete, your purchase
        transaction information is deleted. All direct payment gateways adhere to the standards set
        by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of
        brands like Visa, Mastercard, American Express and Discover. PCI-DSS requirements help
        ensure the secure handling of credit card information by our store and its service
        providers.
      </p>

      <h3>SECTION 5 – THIRD-PARTY SERVICES</h3>
      <p>
        In general, the third-party providers used by us will only collect, use and disclose your
        information to the extent necessary to allow them to perform the services they provide to
        us. However, certain third-party service providers, such as payment gateways and other
        payment transaction processors, have their own privacy policies in respect to the
        information we are required to provide to them for your purchase-related transactions. For
        these providers, we recommend that you read their privacy policies so you can understand the
        manner in which your personal information will be handled by these providers. Once you leave
        our store&apos;s website or are redirected to a third-party website or application, you are
        no longer governed by this Privacy Policy or our website&apos;s Terms of Service.
      </p>
      <h4>Links</h4>
      <p>
        When you click on links on our store, they may direct you away from our site. We are not
        responsible for the privacy practices of other sites and encourage you to read their privacy
        statements.
      </p>
      <h4>Google Analytics</h4>
      <p>Our store uses Google Analytics to help us learn about who visits our site and what pages are being looked at.</p>

      <h3>SECTION 6 – SECURITY</h3>
      <p>
        To protect your personal information, we take reasonable precautions and follow industry
        best practices to make sure it is not inappropriately lost, misused, accessed, disclosed,
        altered or destroyed. If you provide us with your credit card information, the information
        is encrypted using secure socket layer technology (SSL) and stored with AES-256 encryption.
        Although no method of transmission over the Internet or electronic storage is 100% secure, we
        follow all PCI-DSS requirements and implement additional generally accepted industry
        standards.
      </p>

      <h3>SECTION 7 – COOKIES</h3>
      <p>
        Here is a list of cookies that we use — we&apos;ve listed them here so you can choose if you
        want to opt out of cookies or not: <em>_session_id</em> (unique token, sessional — allows us
        to store information about your session, e.g. referrer, landing page);{" "}
        <em>_secure_session_id</em> (unique token, sessional); <em>storefront_digest</em> (unique
        token, indefinite — used to determine if a visitor has access when the shop has a password);{" "}
        <em>PREF</em> (persistent for a short period — set by Google, tracks who visits the store and
        from where).
      </p>

      <h3>SECTION 8 – AGE OF CONSENT</h3>
      <p>
        By using this site, you represent that you are at least the age of majority in your state or
        province of residence, or that you have given us your consent to allow any of your minor
        dependents to use this site.
      </p>

      <h3>SECTION 9 – CHANGES TO THIS PRIVACY POLICY</h3>
      <p>
        We reserve the right to modify this privacy policy at any time, so please review it
        frequently. Changes and clarifications will take effect immediately upon their posting on
        the website. If we make material changes to this policy, we will notify you here that it has
        been updated, so that you are aware of what information we collect, how we use it, and under
        what circumstances, if any, we use and/or disclose it.
      </p>

      <h3>QUESTIONS AND CONTACT INFORMATION</h3>
      <p>
        If you would like to access, correct, amend or delete any personal information we have about
        you, register a complaint, or simply want more information, contact our Privacy Compliance
        Officer at booking@guidewala.co.in.
      </p>
    </LegalPage>
  );
}
