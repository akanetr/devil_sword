  //=============================================================================
// ItemCombination.js
//=============================================================================

/*:
 * @plugindesc Creates an item combination system.
 * @author Jeremy Cannady
 *
 *
 * @help 
 *
 *
 *
	NoteTags
	<comboChance:0.95>     	where 0.95 is 95%
	<comboIngredient1:1,1>  where you require one item #1 
	<comboIngredient2:2,3>	where you require three of item #2
	<comboFail:4>			If you fail you make item #4
	
	Plugin Commands
	no spaces and the exact format, must have comboChance, at least one ingredient and the combo fail
	itemComboForget 1    	where you forget the recipe to combine item #1 which is a recipe
	itemComboLearn 5		where you learn the recipe to make item #5
	itemComboChanceChange 7,0.5	where you change item# 7 chance to combine to 0.5 which is 50%
	ItemComboMenuEnabled true	where true or false enables the menu option or not
 *
 *
*/

Game_Party.prototype._CombineMenuEnabled = true;
Game_Party.prototype._craftingRecipes = {};
Game_Party.prototype._craftingLearnedRecipes = [];

var copyOfAddOrginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function() {
	copyOfAddOrginalCommands.call(this)
	if(this.isItemComboEnabled()){
		this.addCommand('Combine', 'itemCombinationCommand', true);
	};
};

Window_MenuCommand.prototype.isItemComboEnabled = function() {
	if($gameParty._craftingLearnedRecipes.length < 1 ){
		return false;
	}else if($gameParty._CombineMenuEnabled == true){
		return true;
	}else{
		return false;
	};
};

var copyOfCreateCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
	copyOfCreateCommandWindow.call(this);
	this._commandWindow.setHandler('itemCombinationCommand',    this.commandCombinationMenu.bind(this));
};

Scene_Menu.prototype.commandCombinationMenu = function() {
    SceneManager.push(Scene_CraftingMenu);
};

var copyOfInitializeCombo = Game_Party.prototype.initialize;
Game_Party.prototype.initialize = function() {
    copyOfInitializeCombo.call(this);
	this.populateCraftingRecipes();
};

Game_Party.prototype.populateCraftingRecipes = function() {
	var lengthOfItemList = $dataItems.length;
	for(var i = 1; i < lengthOfItemList; i++){
		var ingredientArray = [];
		if(typeof $dataItems[i].meta.comboChance !== "undefined"){
			ingredientArray.push(Number($dataItems[i].id));
			ingredientArray.push(Number($dataItems[i].meta.comboChance));
			ingredientArray.push(Number($dataItems[i].meta.comboFail));
			};
		if(typeof $dataItems[i].meta.comboIngredient1 !== "undefined"){
			var ingredientArrayIngredient = $dataItems[i].meta.comboIngredient1.split(',');
			for(var j=0; j<2; j++) {
				ingredientArrayIngredient[j] = parseInt(ingredientArrayIngredient[j], 10);};
				ingredientArray.push(ingredientArrayIngredient);
		};
		if(typeof $dataItems[i].meta.comboIngredient2 !== "undefined"){
			var ingredientArrayIngredient = $dataItems[i].meta.comboIngredient2.split(',');
			for(var j=0; j<2; j++) {
				ingredientArrayIngredient[j] = parseInt(ingredientArrayIngredient[j], 10);};
				ingredientArray.push(ingredientArrayIngredient);
		};
		if(typeof $dataItems[i].meta.comboIngredient3 !== "undefined"){
			var ingredientArrayIngredient = $dataItems[i].meta.comboIngredient3.split(',');
			for(var j=0; j<2; j++) {
				ingredientArrayIngredient[j] = parseInt(ingredientArrayIngredient[j], 10);};
				ingredientArray.push(ingredientArrayIngredient);
		};
		if(typeof $dataItems[i].meta.comboIngredient4 !== "undefined"){
			var ingredientArrayIngredient = $dataItems[i].meta.comboIngredient4.split(',');
			for(var j=0; j<2; j++) {
				ingredientArrayIngredient[j] = parseInt(ingredientArrayIngredient[j], 10);};
				ingredientArray.push(ingredientArrayIngredient);
		};
		if(typeof $dataItems[i].meta.comboIngredient5 !== "undefined"){
			var ingredientArrayIngredient = $dataItems[i].meta.comboIngredient5.split(',');
			for(var j=0; j<2; j++) {
				ingredientArrayIngredient[j] = parseInt(ingredientArrayIngredient[j], 10);};
				ingredientArray.push(ingredientArrayIngredient);
		};	
		if(typeof $dataItems[i].meta.comboChance !== "undefined"){
			Game_Party.prototype._craftingRecipes[$dataItems[i].name] = ingredientArray;
		};
	};		
};

Game_Party.prototype.canCombine = function(recipeKeyName){
	var ingredientArray = $gameParty.ingredients(recipeKeyName);
	var haveAllIngredients = 0;
	for(i =0;i< ingredientArray.length;i++){
		var itemNumber = ingredientArray[i][0];
		var requiredAmount = ingredientArray[i][1];
		if ($gameParty.numItems($dataItems[itemNumber]) >= requiredAmount){
			haveAllIngredients += 1;
		};
	};
	return (haveAllIngredients === $gameParty.ingredients(recipeKeyName).length);
};

Game_Party.prototype.learnRecipe = function(value) {
	if(this._craftingLearnedRecipes.indexOf(value) === -1){
		this._craftingLearnedRecipes.push(value);
	};
};

Game_Party.prototype.forgetRecipe = function(value) {
	//Stores the value of the index, if the value is -1 then we do not have the recipe.
	var index = this._craftingLearnedRecipes.indexOf(value);
	//If we do have the recipe learned then delete it from out learned recipes list.
	if(this._craftingLearnedRecipes.indexOf(value) != -1){
		this._craftingLearnedRecipes.splice(index,1);
	};
};

Game_Party.prototype.changeItemComboChance = function(recipeName, newChance) {
	var recipeDetails = Game_Party.prototype._craftingRecipes[recipeName];
	recipeDetails[1] = newChance;
};

Game_Party.prototype.ingredients = function(recipeKeyName){
	var recipeDetails = Game_Party.prototype._craftingRecipes[recipeKeyName];
	var ingredientsList =[];
	for(i = 3; i < recipeDetails.length; i++){
		var itemNumber = recipeDetails[i];
		ingredientsList.push(itemNumber);
	};
	return ingredientsList;
};

function craftingTitleWindow() {
    this.initialize.apply(this, arguments);
};

craftingTitleWindow.prototype = Object.create(Window_Base.prototype);
craftingTitleWindow.prototype.constructor = craftingTitleWindow;

craftingTitleWindow.prototype.initialize = function(x, y) {
    var width = this.windowWidth();
    var height = this.windowHeight();
	Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.update();
};

craftingTitleWindow.prototype.windowWidth = function() {
    return Graphics.width;
};

craftingTitleWindow.prototype.windowHeight = function() {
    return this.fittingHeight(1);
};

craftingTitleWindow.prototype.drawCraftingTitle = function( x, y, width) {
    var unitWidth = Math.min(80);
    this.resetTextColor();
    this.drawText("Item Combination Menu", x, y, width - unitWidth - 6, 'left');
    this.changeTextColor(this.systemColor());
};
   
craftingTitleWindow.prototype.update = function() {
    var x = this.textPadding();
    var width = this.contents.width - this.textPadding() * 2;
    this.contents.clear();
	this.drawCraftingTitle( 0, 0, width);
};

function craftingListWindow() {
    this.initialize.apply(this, arguments);
}

craftingListWindow.prototype = Object.create(Window_Command.prototype);
craftingListWindow.prototype.constructor = craftingListWindow;



craftingListWindow.prototype.initialize = function(x, y) {
    Window_Command.prototype.initialize.call(this, x, y);
    this.selectLast();
};

craftingListWindow.prototype.update = function() {
	Window_Command.prototype.update.call(this);
 };
 
craftingListWindow.initCommandPosition = function() {
    this._lastCommandSymbol = null;
};

craftingListWindow.prototype.windowWidth = function() {
    return 240;
};

craftingListWindow.prototype.windowHeight = function() {
    return Graphics.height - craftingTitleWindow.prototype.windowHeight();
};

craftingListWindow.prototype.numVisibleRows = function() {
    return this.maxItems();
};

craftingListWindow.prototype.makeCommandList = function() {
    this.addOriginalCommands();
};

craftingListWindow.prototype.addOriginalCommands = function() {
  	var numberOfLearnedRecipes = $gameParty._craftingLearnedRecipes;
	for(var i = 0; i < numberOfLearnedRecipes.length; i++){
		var recipeKeyName = $gameParty._craftingLearnedRecipes[i];
		var enabled = $gameParty.canCombine(recipeKeyName);
		var recipeDetails = $gameParty._craftingRecipes[recipeKeyName];
		var itemNumber = recipeDetails[0];
		this.addCommand($dataItems[itemNumber].name, $dataItems[itemNumber].name, enabled);
	};
 };
 
craftingListWindow.prototype.isCurrentItemEnabled = function(){
	var recipeKeyName = $gameParty._craftingLearnedRecipes[craftingDetailsWindow.prototype.currentItemIndex];
	return $gameParty.canCombine(recipeKeyName);
};

craftingListWindow.prototype.processOk = function() {
    craftingListWindow._lastCommandSymbol = this.currentSymbol();
    Window_Command.prototype.processOk.call(this);
};

craftingListWindow.prototype.selectLast = function() {
    this.selectSymbol(craftingListWindow._lastCommandSymbol);
};

function craftingDetailsWindow() {
    this.initialize.apply(this, arguments);
};

craftingDetailsWindow.prototype = Object.create(Window_Base.prototype);

craftingDetailsWindow.prototype.constructor = craftingDetailsWindow;
craftingDetailsWindow.prototype.currentItemIndex = 0;

craftingDetailsWindow.prototype.initialize = function(x, y) {
    var width = this.windowWidth();
    var height = this.windowHeight();
	Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.update();
};

craftingDetailsWindow.prototype.windowWidth = function() {
    return Graphics.width - craftingListWindow.prototype.windowWidth();
};

craftingDetailsWindow.prototype.windowHeight = function() {
    return Graphics.height - craftingTitleWindow.prototype.windowHeight();
};

craftingDetailsWindow.prototype.update = function() {
	Window_Base.prototype.update.call(this);
    this.contents.clear();
	this.drawDetailsName(0, 0, this.windowWidth());
	this.drawIngredient(0, 200, this.windowWidth() / 2);
	this.drawComboChance(0, this.windowHeight() - this.lineHeight() * 5,this.windowWidth());
};

craftingDetailsWindow.prototype.drawDetailsName = function(x, y, width) {
	var recipeKeyName = $gameParty._craftingLearnedRecipes[this.currentItemIndex];
	var recipeDetails = $gameParty._craftingRecipes[recipeKeyName];
	var itemNumber = recipeDetails[0];
	
	//Gray out the details page if we can't craft it
	this.changePaintOpacity($gameParty.canCombine(recipeKeyName));
	
	//Draw  name 
	this.resetTextColor();
	this.makeFontBigger();
	this.drawText($dataItems[itemNumber].name, x, y, width - 32, 'center');
	this.makeFontSmaller();
	
	///Draw description
	this.drawText($dataItems[itemNumber].description, x, y + 100 + 12, width - 32, 'center');
    this.changeTextColor(this.systemColor());
	
	//Draw bigger icon
	this.bitmapIcon = new Sprite(ImageManager.loadSystem('IconSet'));
	
	//Change the scale to twice as big
	this.bitmapIcon.scale.x = 2;
	this.bitmapIcon.scale.y = 2;
	this.bitmapIcon.x = this.windowWidth()/2 - 32;
	this.bitmapIcon.y = y + 50 + 12;
	var pw = Window_Base._iconWidth;
	var ph = Window_Base._iconHeight;
	var sx = $dataItems[itemNumber].iconIndex % 16 * pw;
	var sy = Math.floor($dataItems[itemNumber].iconIndex / 16) * ph;
	this.addChild(this.bitmapIcon);
	this.bitmapIcon.setFrame(sx, sy, 32, 32);
};

craftingDetailsWindow.prototype.drawIngredient = function(x, y, width) {
	this.resetTextColor();
	this.drawText('Required Ingredients :', x, y-this.lineHeight(), this.windowWidth()/2+this.textWidth(':')+6, 'right');
	var recipeKeyName = $gameParty._craftingLearnedRecipes[craftingDetailsWindow.prototype.currentItemIndex];
	var ingredientArray = $gameParty.ingredients(recipeKeyName);
	var Y = y;
	
	for(i = 0;i < ingredientArray.length; i++){
		y = Y + 32*i + 6;
		var itemNumber = ingredientArray[i][0];
		var requiredAmount = ingredientArray[i][1];
		var ingredient = $dataItems[itemNumber];
		if ($gameParty.numItems(ingredient) >= requiredAmount){
			this.resetTextColor();
		}
		else{
			this.changeTextColor(this.hpGaugeColor1())
		};
		var text = $gameParty.numItems(ingredient) + '/' + requiredAmount;
		var offset = 150;
		this.drawText(text, this.windowWidth()/2+this.textWidth(': ')+6, y, this.windowWidth()/2, 'left');
		this.drawIcon($dataItems[itemNumber].iconIndex,this.windowWidth()/2-32 , y );
		this.drawText(ingredient.name, 0 , y, this.windowWidth()/2-32-6, 'right');
		this.drawText(': ', this.windowWidth()/2+6 , y, this.windowWidth()/2, 'left');
	};
	this.resetTextColor();
};

craftingDetailsWindow.prototype.drawComboChance = function(x, y, width) {
	this.resetTextColor();
	var recipeKeyName = $gameParty._craftingLearnedRecipes[this.currentItemIndex];
	var recipeDetails = $gameParty._craftingRecipes[recipeKeyName];
	var chance = recipeDetails[1] * 100;
	if(chance > 75){
		this.changeTextColor(this.textColor(3))
	}else if(chance > 50){
		this.changeTextColor(this.textColor(14))
	}else if(chance > 25){
		this.changeTextColor(this.textColor(20))
	}else {
		this.changeTextColor(this.textColor(10))
	};
	
	this.drawText(chance + ' %', x, y, this.windowWidth() - 32 , 'center');
    this.changeTextColor(this.systemColor());
};

function craftingCombineCommand() {
    this.initialize.apply(this, arguments);
}

craftingCombineCommand.prototype = Object.create(Window_Command.prototype);
craftingCombineCommand.prototype.constructor = craftingCombineCommand;

craftingCombineCommand.prototype.canCombine = false;


craftingCombineCommand.prototype.initialize = function(x, y) {
    Window_Command.prototype.initialize.call(this, x, y);
    this.selectLast();
	this.deselect();
	this.deactivate();
};

craftingCombineCommand.prototype.update = function() {
	Window_Command.prototype.update.call(this);
	this.drawItem(0);
 };
 
craftingCombineCommand.prototype.initCommandPosition = function() {
    this._lastCommandSymbol = null;
};

craftingCombineCommand.prototype.isCurrentItemEnabled = function(){
	var recipeKeyName = $gameParty._craftingLearnedRecipes[craftingDetailsWindow.prototype.currentItemIndex];
	return $gameParty.canCombine(recipeKeyName);
};

craftingCombineCommand.prototype.drawItem = function(index){
	var rect = this.itemRectForText(index);
	var recipeKeyName = $gameParty._craftingLearnedRecipes[craftingDetailsWindow.prototype.currentItemIndex];
	this.changePaintOpacity($gameParty.canCombine(recipeKeyName));
    this.resetTextColor();
    this.addCommand("Combine", "Combine", $gameParty.canCombine(recipeKeyName));
	this.drawText(this.commandName(index), rect.x , rect.y, rect.width, 'center')
	this.resetTextColor();
};

craftingCombineCommand.prototype.processOk = function() {
    craftingCombineCommand._lastCommandSymbol = this.currentSymbol();
    Window_Command.prototype.processOk.call(this);
};

craftingCombineCommand.prototype.selectLast = function() {
    this.selectSymbol(craftingDetailsWindow._lastCommandSymbol);
};

craftingCombineCommand.prototype.maxItems = function() {
    return 1;
};

craftingCombineCommand.prototype.maxCols = function(){
	return 1;
};

craftingCombineCommand.prototype.standardPadding = function() {
    return 6;
};



function Scene_CraftingMenu() {
    this.initialize.apply(this, arguments);
}
Scene_CraftingMenu.prototype = Object.create(Scene_MenuBase.prototype);
Scene_CraftingMenu.prototype.constructor = Scene_CraftingMenu;

Scene_CraftingMenu.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_CraftingMenu.prototype.update = function() {
	Scene_MenuBase.prototype.update.call(this);
	this.updateDetails();
};

Scene_CraftingMenu.prototype.updateDetails = function(){
	if(this._commandItemWindow.active){
		craftingDetailsWindow.prototype.currentItemIndex = this._commandItemWindow.index();
	};
};

Scene_CraftingMenu.prototype.create = function() {
   Scene_MenuBase.prototype.create.call(this);
   this.createTitleWindow();
   this.createCommandWindow();
   this.createDetailsWindow(); 
   this.createCombineWindow(); 
};
 
Scene_CraftingMenu.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
};
	
Scene_CraftingMenu.prototype.createCommandWindow = function() {
    var y = craftingTitleWindow.prototype.windowHeight();
    this._commandItemWindow = new craftingListWindow(0, y);
	this._commandItemWindow.setHandler('ok',    	this.commandCombine.bind(this));
	this._commandItemWindow.setHandler('cancel',    this.commandCancel.bind(this));
	this.addWindow(this._commandItemWindow);
};

Scene_CraftingMenu.prototype.commandCancel = function() {
	if($gamePlayer._CombineMenuEnabled === true){
		SceneManager.pop();
	}else{
		SceneManager.goto(Scene_Map);
	};
};

Scene_CraftingMenu.prototype.createDetailsWindow = function() {
	var x = craftingListWindow.prototype.windowWidth();
	var y = craftingTitleWindow.prototype.windowHeight();
    this._commandDetailsWindow = new craftingDetailsWindow(x, y);
	this.addWindow(this._commandDetailsWindow );
};
Scene_CraftingMenu.prototype.createCombineWindow = function() {
	var x1 = craftingListWindow.prototype.windowWidth();
	var x2 = craftingDetailsWindow.prototype.windowWidth()/2;
	var x3 = craftingCombineCommand.prototype.windowWidth()/2;
	var x = x1 + x2 - x3;
	var y = Graphics.height - craftingCombineCommand.prototype.windowHeight()-12;
	this._commandCombineWindow = new craftingCombineCommand(x, y);
	this.addWindow(this._commandCombineWindow );
};

Scene_CraftingMenu.prototype.createTitleWindow = function() {
    this._craftingTitleWindow = new craftingTitleWindow(0, 0);
    this.addWindow(this._craftingTitleWindow);
};

Scene_CraftingMenu.prototype.commandCombine = function() {
	this._commandCombineWindow.selectLast();
	this._commandItemWindow.deselect();
    this._commandCombineWindow.activate();
	this._commandCombineWindow .setHandler('ok',    	this.onDetailsOk.bind(this));
	this._commandCombineWindow .setHandler('cancel',    this.onDetailsCancel.bind(this));
};

Scene_CraftingMenu.prototype.onDetailsOk = function() {
	var recipeKeyName = $gameParty._craftingLearnedRecipes[craftingDetailsWindow.prototype.currentItemIndex];
	var ingredientArray = $gameParty.ingredients(recipeKeyName);
	var recipeDetails = $gameParty._craftingRecipes[recipeKeyName];
	var itemNumber = recipeDetails[0];
	
	if($gameParty.canCombine(recipeKeyName)){
		for(i = 0;i < ingredientArray.length; i++){
			var requiredAmount = ingredientArray[i][1];
			var ingredient = $dataItems[ingredientArray[i][0]];
			$gameParty.loseItem(ingredient, requiredAmount);
		};

		if(Math.random() < recipeDetails[1]){
			$gameParty.gainItem($dataItems[itemNumber], 1);
		}
		else{
			$gameParty.gainItem($dataItems[recipeDetails[2]], 1);
			SoundManager.playBuzzer();
		};
	};
	SceneManager.goto(Scene_CraftingMenu);
};

Scene_CraftingMenu.prototype.onDetailsCancel = function() {
	this._commandItemWindow.selectLast();
    this._commandItemWindow.activate();
};

var comboMenuEnabled_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	comboMenuEnabled_pluginCommand.call(this, command, args);
	if (command === "ItemComboMenuEnabled") {
	$gameParty._CombineMenuEnabled = JSON.parse(args[0]);
	};
};

var itemComboLearn_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	itemComboLearn_pluginCommand.call(this, command, args);
	if (command === "itemComboLearn") {
		var arg = $dataItems[JSON.parse(args[0])].name;
		$gameParty.learnRecipe(arg);
	};
};

var itemComboChance_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	itemComboChance_pluginCommand.call(this, command, args);
	if (command === "itemComboChanceChange") {
		var arg1 = $dataItems[JSON.parse(args[0])].name;
		var arg2 = JSON.parse(args[1]);
		$gameParty.changeItemComboChance(arg1,arg2);
	};
};

var itemComboForget_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	itemComboForget_pluginCommand.call(this, command, args);
	if (command === "itemComboForget") {
		var arg = $dataItems[JSON.parse(args[0])].name;
		$gameParty.forgetRecipe(arg);
	};
};