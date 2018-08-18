import Controls = require("VSS/Controls");
import Combos = require("VSS/Controls/Combos");
import * as Models from "./model";
//import * as VSSUtilsCore from "VSS/Utils/Core";
import { ErrorView } from "./errorview";

//https://github.com/Microsoft/vsts-extension-multivalue-control/blob/master/src/MultiValueCombo.ts
/**
 * Class TCStepsCompareControl returns a container that renders comboboxes, the selected value,
 * and a function that allows the user to change the selected value.
 */
export class TCStepsCompareControl {
    public stepsRevs: Models.TCStepsRevisions[] = [];
    private _mainContainer: JQuery;
    private _leftComboboxContainer: JQuery;
    private _rightComboboxContainer: JQuery;
    private _compareBtnContainer: JQuery;
    private _errorView: ErrorView;

    constructor(mainContainer: JQuery, private onCompareBtnClick: Function) {
        this._mainContainer = mainContainer;
        this.init();
    }

    // creates the container
    public init(): void {
        this._mainContainer.empty();
        this._errorView = new ErrorView(this._mainContainer);
        var label1Container = $("<label for='v1'>Version 1:</label>");
        var label2Container = $("<label for='v2'>Version 2:</label>");
        label2Container.addClass("marginLeft20");

        this._leftComboboxContainer = $("<select id='v1'></select>");
        this._leftComboboxContainer.addClass("width200");
        this._leftComboboxContainer.addClass("marginLeft10");
        this._leftComboboxContainer.attr("disabled", "disabled")

        this._rightComboboxContainer = $("<select id='v2'></select>");
        this._rightComboboxContainer.addClass("width200");
        this._rightComboboxContainer.addClass("marginLeft10");
        this._rightComboboxContainer.attr("disabled", "disabled")

        this._compareBtnContainer = $("<input type='button' value='Compare'/>");
        this._compareBtnContainer.addClass("marginLeft10");
        this._compareBtnContainer.attr("disabled", "disabled")

        this._mainContainer.append(label1Container);
        this._mainContainer.append(this._leftComboboxContainer);
        this._mainContainer.append(label2Container);
        this._mainContainer.append(this._rightComboboxContainer);
        this._mainContainer.append(this._compareBtnContainer);

        this._compareBtnContainer.click((evt: JQueryMouseEventObject) => {
            this._click(evt);
        });
    }

    public updateCombos(model: Models.TCStepsRevisions[]) {
        if (!model) {
            console.warn("model is null");
            return;
        }
        this.stepsRevs = model;
        this._populateComboboxes(this._rightComboboxContainer);
        this._rightComboboxContainer.removeAttr("disabled");
        (<HTMLSelectElement>this._rightComboboxContainer[0]).selectedIndex = 0;

        this._populateComboboxes(this._leftComboboxContainer);
        this._leftComboboxContainer.removeAttr("disabled");

        if (model.length > 1) {
            (<HTMLSelectElement>this._leftComboboxContainer[0]).selectedIndex = 1;
        }
        else {
            (<HTMLSelectElement>this._leftComboboxContainer[0]).selectedIndex = 0;
        }

        this._compareBtnContainer.removeAttr("disabled");
    }

    /**
    * Populates the UI with the list of check boxes to choose the value from.
    */
    private _populateComboboxes(container: JQuery): void {
        // clear all child elements
        container.empty();

        $.each(this.stepsRevs, (i, value) => {
            this._createOptionItemControl(container, value.toString());
        });
    }

    private _createOptionItemControl(container: JQuery, value: string, ) {
        let optionContainer = $("<option>" + value + "</option>");
        container.append(optionContainer);
    }

    public writeError(msg: string) {
        this._errorView.showError(msg);
    }

    public clearError() {
        this._errorView.clearError();
    }

    private _click(evt: JQueryMouseEventObject): void {
        //let itemClicked = $(evt.target).closest(".row").data("value");
        if ($.isFunction(this.onCompareBtnClick)) {
            if ((<HTMLSelectElement>this._leftComboboxContainer[0]).selectedIndex != (<HTMLSelectElement>this._rightComboboxContainer[0]).selectedIndex) {
                this.onCompareBtnClick((<HTMLSelectElement>this._leftComboboxContainer[0]).selectedIndex,
                    (<HTMLSelectElement>this._rightComboboxContainer[0]).selectedIndex, this.stepsRevs);
            }
            else {
                alert("same revision selected, please change");
            }
        }
    }
}