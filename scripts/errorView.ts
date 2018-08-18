/***************************************************************************
Purpose: This class is being used to get errors from an input parser and 
            a model. It takes all the errors and put them in an array in
            order to be sent to a view to display them.       
***************************************************************************/

// shows the errors in the control container rather than the control.
export class ErrorView {
 /**
     * The container for error message display
     */
    private _errorPane: JQuery;

    constructor(containerElement:JQuery) {
        // container div
         this._errorPane = $("<div>").addClass("errorPane").appendTo(containerElement);       
    }

    public showError(error: string): void {
        this._errorPane.text(error);
        this._errorPane.show();
    }

    public clearError() {
        this._errorPane.text("");
        this._errorPane.hide();
    }
}