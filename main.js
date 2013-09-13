/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
  "use strict";

  var CommandManager = brackets.getModule("command/CommandManager"),
      Menus          = brackets.getModule("command/Menus");

  
  // Function to run when the menu item is clicked
  function handleOpenSite() {
    window.alert("Hello, world!");
  }
  
  
  // First, register a command - a UI-less object associating an id to a handler
  var MY_COMMAND_ID = "brackets-wpeditor.opensite";   // package-style naming to avoid collisions
  CommandManager.register("Open WordPress Site", MY_COMMAND_ID, handleOpenSite);

  // Then create a menu item bound to the command
  // The label of the menu item is the name we gave the command (see above)
  var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
  menu.addMenuItem(MY_COMMAND_ID);
  
  // We could also add a key binding at the same time:
  //menu.addMenuItem(MY_COMMAND_ID, "Ctrl-Alt-H");
  // (Note: "Ctrl" is automatically mapped to "Cmd" on Mac)

  exports.handleOpenSite = handleOpenSite;
});