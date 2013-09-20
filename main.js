/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
  "use strict";
  
  require('lib/aes'); /* AES JavaScript implementation */
  require('lib/aes-ctr'); /* AES Counter Mode implementation */
  require('lib/base64'); /* Base64 encoding */
  require('lib/utf8'); /* UTF-8 encoding */

  var CommandManager = brackets.getModule("command/CommandManager"),
      Menus          = brackets.getModule("command/Menus"),
      Dialogs        = brackets.getModule("widgets/Dialogs"),
      ProjectManager = brackets.getModule("project/ProjectManager"),
      SettingsDialog = require("text!htmlContent/settings-dialog.html"),
      FileSystem     = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
      FileUtils      = brackets.getModule("file/FileUtils");

  var WordPressSettings = {
    Url: '',
    Name: '',
    Key: ''
  };
  
  /* Set the settings file location */
  var settingsFileName = ".wordpress_settings";
  var settingsFile = '';
  
  // Function to run when the menu item is clicked
  function handleOpenSite() {
    window.alert("Hello, world!");
  }
  
  
  // First, register a command - a UI-less object associating an id to a handler
  var CMD_OPENSITE_ID = "brackets-wpeditor.opensite";   // package-style naming to avoid collisions
  CommandManager.register("Open WordPress Site", CMD_OPENSITE_ID, showSettingsDialog);

  // Then create a menu item bound to the command
  // The label of the menu item is the name we gave the command (see above)
  var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
  menu.addMenuItem(CMD_OPENSITE_ID);
  
  // We could also add a key binding at the same time:
  //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-H");
  // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)

  exports.handleOpenSite = handleOpenSite;
  
  /* Save settings to object and file */
  function saveWordPressSettings(newSettings) {
    $.extend(WordPressSettings, newSettings);
    
    var fileEntry = new FileSystem.FileEntry(settingsFile);
    var projectsData = JSON.stringify(WordPressSettings);
    FileUtils.writeText(fileEntry, projectsData).done(function () {});
    
    console.log('Saving WordPress settings');
  }
  
  function readWordPressSettings() {
    console.log('Project opening ... reading WordPress settings');
    var fileEntry = new FileSystem.FileEntry(settingsFile);
    if(fileEntry) {
      var readSettingsPromise = FileUtils.readAsText(fileEntry);
      readSettingsPromise.done(function (result) {
        //remotesettings file does exist, read in JSON into object                
        if(result) {
          $.extend(WordPressSettings, $.parseJSON(result));
        }
      });
    }
  }
  
  function showSettingsDialog() {
    /* Create temporary copy of the settings */
    var tempWordPressSettings = {};
    $.extend(tempWordPressSettings, WordPressSettings);

    /* Show the settings dialog and setup the save action */
    Dialogs.showModalDialogUsingTemplate(SettingsDialog, true).done(function (id) {
      if (id === "save") {
        saveWordPressSettings(tempWordPressSettings);
      }
    });

    /* Map the settings to their form inputs and add binding back to the temporary settings object */
    var map = [
      {id:'#wpe-url',key:'Url'},
      {id:'#wpe-name',key:'Name'},
      {id:'#wpe-key',key:'Key'},
    ];
    $(map).each(function () {
      var key = this.key;
      $(this.id).val(tempWordPressSettings[key]).change(function () { tempWordPressSettings[key] = $(this).val() });
    });

    /* Check connection button */
    $('#wpe-check-connection').click(function () {
      var verified = $('#wpe-verified').html('Connecting...');

      var data = {};
      var success = function (data) {
        data = JSON.parse(data);
        if(data.success) {
          verified.html('Success!');
        } else {
          verified.html('Failed...');
        }
      };
      sendPost('wteb_verify_key', {}, success, tempWordPressSettings.Url, tempWordPressSettings.Name, tempWordPressSettings.Key);
    });
    
  }
  
  function sendPost(action, data, callback, url, name, key) {
    data = Aes.Ctr.encrypt(JSON.stringify(data), key, 256);
    var send = {
      action: action,
      name: name,
      data: data
    }
    $.post(url, send, callback);
  }

  $(ProjectManager).on("projectOpen", function () {
    settingsFile = ProjectManager.getProjectRoot().fullPath + settingsFileName;
    readWordPressSettings();
  });
  

});