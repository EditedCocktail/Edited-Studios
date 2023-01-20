function ProtectedTextApi(site_id, passwd) {
  this.siteHash = CryptoJS.SHA512("/" + site_id).toString();
  this.pass = passwd;
  this.passHash = CryptoJS.SHA512(passwd).toString();
  this.endpoint = "https://www.protectedtext.com/"+site_id;
  this.siteObj = {};
  this.dbversion = 0;
  this.view = async function () {
    if ( Online() ) {
      this.siteObj = (await axios.get(this.endpoint.concat('?action=getJSON'))).data;
      this.dbversion = this.siteObj['currentDBVersion'];
      this.rawtext = CryptoJS.AES.decrypt(this.siteObj['eContent'], this.pass).toString(CryptoJS.enc.Utf8);
      this.rawtext = this.rawtext.substring(0, (this.rawtext.length - 128));
      return this.rawtext;
    }
    return {};
  }
  this.save = async function (textToSave) {
    if ( Online() ) {
      const encript = String(textToSave + this.siteHash);
      var textEncrypted = (await CryptoJS.AES.encrypt(encript, this.pass)).toString();
      const postdata = new URLSearchParams();
      postdata.append("initHashContent", this.getWritePermissionProof(this.rawtext));
      postdata.append("currentHashContent", this.getWritePermissionProof(textToSave));
      postdata.append("encryptedContent", textEncrypted);
      postdata.append("action", "save");
      var ret = undefined;
      try {
        ret = (await axios.post(this.endpoint, postdata, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        })).data;
      } catch (err) {
        throw Error(err.message);
      }
      this.rawtext = textToSave;
      return (ret['status'] == 'success');
    }
    return false;
  }
  this.deleteSite = async function () {
    var inithashcontent = this.getWritePermissionProof(this.rawtext);
    const deleteAction = new URLSearchParams();
    deleteAction.append("initHashContent", inithashcontent);
    deleteAction.append("action", "delete");
    return (await axios.post(this.endpoint, deleteAction)).data['status'] == 'success';
  }
  this.getWritePermissionProof = function (content) {
    return (this.dbversion == 1)?CryptoJS.SHA512(content).toString():CryptoJS.SHA512(content + this.passHash).toString() + this.dbversion
  }
  return this;
}
