/**
 * AC Scanner — Google Sheet endpoint.
 *
 * Setup:
 *  1. Open your Google Sheet → Extensions → Apps Script.
 *  2. Delete any code there and paste this whole file.
 *  3. Deploy → New deployment → type "Web app":
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  4. Copy the Web app URL (ends with /exec) and paste it into the
 *     scanner's ⚙️ settings on your phone.
 *
 * Each scan is appended as a row to the "Scans" tab. Photos are saved
 * to a Drive folder called "AC Scanner Photos" and linked in the row.
 */

var SHEET_NAME = 'Scans';
var PHOTO_FOLDER = 'AC Scanner Photos';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();

    var photoUrl = '';
    if (data.photo) {
      photoUrl = savePhoto_(data);
    }

    sheet.appendRow([
      data.ts ? new Date(data.ts) : new Date(),
      data.serial || '',
      data.brand || '',
      data.model || '',
      data.type || '',
      data.btu || '',
      data.location || '',
      data.status || '',
      data.notes || '',
      photoUrl
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Used by the scanner's "Test connection" button.
function doGet() {
  return json_({ ok: true, service: 'AC Scanner endpoint' });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Serial', 'Brand', 'Model', 'Type',
                     'BTU', 'Location', 'Condition', 'Notes', 'Photo']);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function savePhoto_(data) {
  var it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
  var name = (data.serial || 'scan') + '_' + Date.now() + '.jpg';
  var blob = Utilities.newBlob(Utilities.base64Decode(data.photo), 'image/jpeg', name);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
