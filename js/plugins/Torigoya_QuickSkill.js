/*---------------------------------------------------------------------------*
 * Torigoya_QuickSkill.js
 *---------------------------------------------------------------------------*
 * 2018/06/16 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc usable Quick skill (select and action!)
 * @author ru_shalm
 *
 * @help
 *
 * Skill Note:
 *   <QuickSkill>           # set quick skill
 */

/*:ja
 * @plugindesc 選択するとターンを消費せずに即発動するスキルを追加します。
 * @author ru_shalm
 *
 * @help
 * ターン消費なしスキルを作れるようになります。
 *
 * ------------------------------------------------------------
 * ■ 設定方法
 * ------------------------------------------------------------
 * スキルのメモ欄に以下のように記述してください。
 *
 * <QuickSkill>
 */

(function (global) {
    'use strict';

    var QuickSkill = {
        currentActionActor: null,
        originalSubject: null,
        actorIndexForForcedAction: null,
        backupActions: null
    };

    // ターン消費なしスキル中はActionを減らさないようにしないと死ぬ
    Game_Battler.prototype.removeCurrentAction = function () {
        if (QuickSkill.currentActionActor) {
            this._actions[0] = new Game_Action(this);
            this._actions.sort(function (a, _) {
                return a._item.isNull() ? 1 : 0;
            });
        } else if (QuickSkill.actorIndexForForcedAction !== null) {
            this._actions = QuickSkill.backupActions;
        } else {
            this._actions.shift();
        }
    };

    // ターン消費なし戦闘行動の強制の場合は行動を保存してあげる
    var upstream_Game_Battler_forceAction = Game_Battler.prototype.forceAction;
    Game_Battler.prototype.forceAction = function(skillId, targetIndex) {
        if (BattleManager._phase === 'torigoya_quickSkill') {
            QuickSkill.backupActions = this._actions;
        }
        upstream_Game_Battler_forceAction.apply(this, arguments);
    };

    // Actionが決定されたら、Actionの中にターン消費なしスキルがないか調べる
    var upstream_Scene_Battle_selectNextCommand = Scene_Battle.prototype.selectNextCommand;
    Scene_Battle.prototype.selectNextCommand = function () {
        QuickSkill.currentActionActor = BattleManager.actor();
        if (QuickSkill.currentActionActor) {
            var actions = QuickSkill.currentActionActor._actions;
            for (var i = 0; i < actions.length; ++i) {
                if (actions[i]._item.isNull()) continue;
                if (actions[i]._item.object().meta['QuickSkill']) {
                    actions.unshift(actions.splice(i, 1)[0]);
                    QuickSkill.originalSubject = BattleManager._subject;
                    BattleManager._subject = BattleManager.actor();
                    BattleManager.processTurn();
                    $gameTroop._interpreter.setupReservedCommonEvent();
                    return;
                }
            }
            QuickSkill.currentActionActor = null;
        }
        upstream_Scene_Battle_selectNextCommand.apply(this);
    };

    // ターン消費なしスキル中なら後片付け
    var upstream_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        upstream_BattleManager_endAction.apply(this);

        // 後始末
        if (QuickSkill.currentActionActor) {
            this._phase = 'torigoya_quickSkill';
            this._subject = QuickSkill.originalSubject;
            if (this.actor() && this.actor().canInput()) {
                this.changeActor(this._actorIndex, 'undecided');
            } else {
                this.selectNextCommand();
            }
            QuickSkill.currentActionActor = null;
        }
    };

    // ターン消費なしスキル中にイベントが積まれたら実行する
    var upstream_BattleManager_updateEvent = BattleManager.updateEvent;
    BattleManager.updateEvent = function () {
        switch (this._phase) {
            case 'turn':
                if (QuickSkill.actorIndexForForcedAction !== null) {
                    this._phase = 'torigoya_quickSkill';
                    this._actorIndex = QuickSkill.actorIndexForForcedAction;
                    QuickSkill.actorIndexForForcedAction = null;
                    QuickSkill.backupActions = null;
                }
                break;
            case 'torigoya_quickSkill':
                if (this.isActionForced()) {
                    QuickSkill.actorIndexForForcedAction = this._actorIndex;
                    this.processForcedAction();
                    return true;
                } else if (this.updateEventMain()) {
                    return true;
                }
                if (this._phase === 'torigoya_quickSkill') {
                    this._phase = QuickSkill.isBattleEnd() ? 'turn' : 'input';
                }
                this.refreshStatus();
                break;
        }
        return upstream_BattleManager_updateEvent.apply(this);
    };

    QuickSkill.isBattleEnd = function () {
        return $gameParty.isEmpty() || $gameParty.isAllDead() || $gameTroop.isAllDead();
    };

    // -------------------------------------------------------------------------
    global.Torigoya = (global.Torigoya || {});
    global.Torigoya.QuickSkill = QuickSkill;
})(this);
