import * as utils from "./utils";
import ICVEContent from "./ICVEContent";

export class CVEContent implements ICVEContent {
  cvssVersion: string;
  cvssExplained: string;
  cvssVector: string;
  cvssLink: string;
  htmlDetails: string;
  constructor() {
    this.cvssExplained = "";
    this.cvssVector = "";
    this.cvssLink = "";
    this.htmlDetails = "";
  }
  // var exampled_htmlDetail = "<style>dt { color: #070707; font-weight: bold; margin-top: 18px; margin-bottom: 4px;}dt:first-of-type { margin-top: 0;}p:first-of-type { margin-top: 0;}.vulnerability-malicious-code-warning { color: #c70000; }</style>↵<div id="hds-sd" class="iq-grid-row">↵  <div class="iq-grid-col iq-grid-col--25">↵    <div class="iq-grid-header">↵      <h2 class="iq-grid-header__title">Vulnerability</h2>↵      <hr class="iq-grid-header__hrule">↵    </div>↵    <dl class="vulnerability">↵<dt>↵Issue↵</dt>↵<dd>↵<a target="_blank" rel="noreferrer" href="http://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2019-19844">CVE-2019-19844</a>↵</dd>↵<dt>↵Severity↵</dt>↵<dd>↵CVE CVSS 3: 9.8 <br> CVE CVSS 2.0: 5.0 <br> Sonatype CVSS 3: 9.8↵</dd>↵<dt>↵Weakness↵</dt>↵<dd>↵CVE CWE: <a target="_blank" rel="noreferrer" href="https://cwe.mitre.org/data/definitions/640.html">640</a>↵</dd>↵<dt>↵Source↵</dt>↵<dd>↵National Vulnerability Database↵</dd>↵<dt>↵Categories↵</dt>↵<dd>↵Data↵</dd>↵    </dl>↵  </div>↵  <div class="iq-grid-col">↵    <div class="iq-grid-header">↵      <h2 class="iq-grid-header__title">Description</h2>↵      <hr class="iq-grid-header__hrule">↵    </div>↵    <dl class="vulnerability-description">↵<dt>↵Description from CVE↵</dt>↵<dd>↵Django before 1.11.27, 2.x before 2.2.9, and 3.x before 3.0.1 allows account takeover. A suitably crafted email address &#x28;that is equal to an existing user&#x27;s email address after case transformation of Unicode characters&#x29; would allow an attacker to be sent a password reset token for the matched user account. &#x28;One mitigation in the new releases is to send password reset tokens only to the registered user email address.&#x29;↵</dd>↵<dt>↵Explanation↵</dt>↵<dd>↵<p>Django is vulnerable to Improper Input Validation. The <code>get_users()</code> and <code>save()</code> functions in the <code>forms.py</code> file fail to account for Unicode case transformations and, consequently, performs an insufficient comparison on email addresses submitted via the Password Reset form. A remote attacker can exploit this behavior by providing an email address that leverages Unicode case transformations which, when transformed, will result in an email address that is equal to that of a registered victim. The attacker can leverage this vulnerability to obtain a valid password reset token which may be used to hijack a victim's account, from which the attacker may perform further attacks.</p>↵↵</dd>↵<dt>↵Detection↵</dt>↵<dd>↵<p>The application is vulnerable by using this component.</p>↵↵</dd>↵<dt>↵Recommendation↵</dt>↵<dd>↵<p>We recommend upgrading to a version of this component that is not vulnerable to this specific issue.</p>↵<p>Note: If this component is included as a bundled/transitive dependency of another component, there may not be an upgrade path. In this instance, we recommend contacting the maintainers who included the vulnerable package. Alternatively, we recommend investigating alternative components or a potential mitigating control.</p>↵↵</dd>↵<dt>↵Root Cause↵</dt>↵<dd>↵Django-1.6.tar.gz <b>&lt;=</b> Django-1.6.3/django/contrib/auth/forms.py : ( , 1.8a1)↵</dd>↵<dt>↵Advisories↵</dt>↵<dd>↵Project: <a target="_blank" rel="noreferrer" href="https://www.djangoproject.com/weblog/2019/dec/18/security-releases/">https://www.djangoproject.com/weblog/2019/dec/18/security-re…</a>↵</dd>↵<dt>↵CVSS Details↵</dt>↵<dd>↵CVE CVSS 3: 9.8 <br> CVSS Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H↵</dd>↵    </dl>↵  </div>↵</div>↵"""
  ParseHTML(htmlDetails: string) {
    //Some ideas for visuablising ->https://habilelabs.github.io/cvss-v3.1-react/demo/dist/
    //https://habilelabs.github.io/cvss-v3.1-react/
    //https://medium.com/habilelabs/cvss-calculator-software-vulnerability-scoring-process-25c6a3356751
    //https://www.first.org/cvss/calculator/3.1#CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:C/C:N/I:N/A:L
    //cvssVector->CVSS:3.0/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H
    //cvssVector->CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
    let CVSS3 = "CVSS:3.0/";
    let cvssVersion = "3.0";
    let whereCVSS = htmlDetails.indexOf(CVSS3);
    if (whereCVSS === -1) {
      CVSS3 = "CVSS:3.1/";
      cvssVersion = "3.1";
      whereCVSS = htmlDetails.indexOf(CVSS3);
    }
    let retVal: ICVEContent;
    let returnhtmlDetails: string;
    if (whereCVSS >= 0) {
      let cvssVectorLength = 44;
      let cvssVector = htmlDetails.substring(
        whereCVSS,
        whereCVSS + cvssVectorLength
      );
      console.log("cvssVector", cvssVector);
      //https://www.first.org/cvss/calculator/3.0#CVSS:3.0/AV:N/AC:H/PR:L/UI:R/S:U/C:L/I:L/A:L
      let cvssExplained = utils.CVSSDetails(cvssVector);

      let cvssLink = `<div class="tooltip"><a target="_blank" rel="noreferrer" href="https://www.first.org/cvss/calculator/${cvssVersion}#${cvssVector}">${cvssVector}</a><span class="tooltiptext">${cvssExplained}</span></div>;`;
      returnhtmlDetails = htmlDetails.replace(cvssVector, cvssLink);
      retVal = {
        cvssVersion: cvssVersion,
        cvssExplained: cvssExplained,
        cvssVector: cvssVector,
        cvssLink: cvssLink,
        htmlDetails: returnhtmlDetails
      };
      return retVal;
    }
  }
}
