/** The class control.ts will orchestrate the classes of InputParser, Model and View
 *  in order to perform the required actions of the extensions. 
 */
//import * as VSSService from "VSS/Service";
import * as WitService from "TFS/WorkItemTracking/Services";
import * as RestClient from "TFS/WorkItemTracking/RestClient";
import * as WitContracts from "TFS/WorkItemTracking/Contracts";
//import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";
import * as Models from "./model";
import { TCStepsCompareControl } from "./view";
import * as VSSUtilsCore from "VSS/Utils/Core";
import * as Q from "q";
import { XmlUtils } from "./XmlUtils"

export class TCStepsVersionControlController {
    // members
    private _model: Models.TCStepsRevisions[] = [];
    private _view: TCStepsCompareControl;

    /**
     * Store the last recorded window width to know
     * when we have been shrunk and should resize
     */
    private _windowWidth: number;
    private _minWindowWidthDelta: number = 10; // Minimum change in window width to react to
    private _windowResizeThrottleDelegate: Function;
    private _bodyElement: HTMLBodyElement;

    /* Inherits from initial Config to control if always show field border
     */
    private _showFieldBorder: boolean;

    /**
    * The container to hold the control
    */
    private _containerElement: JQuery;

    //private _TCStepsRevisions: Models.TCStepsRevisions[];

    constructor() {
        let initialConfig = VSS.getConfiguration();
        this._showFieldBorder = !!initialConfig.fieldBorder;
        // get div container element
        this._containerElement = $(".container");
        if (this._showFieldBorder) {
            this._containerElement.addClass("fieldBorder")
        }

        this._view = new TCStepsCompareControl(this._containerElement, this._handleCompare);

        // windows size events
        this._windowResizeThrottleDelegate = VSSUtilsCore.throttledDelegate(this, 50, () => {
            this._windowWidth = window.innerWidth;
            this.resize();
        });

        this._windowWidth = window.innerWidth;
        $(window).resize(() => {
            if (Math.abs(this._windowWidth - window.innerWidth) > this._minWindowWidthDelta) {
                this._windowResizeThrottleDelegate.call(this);
            }
        });
    }

    public clear(): void {
        this._model = [];
    }

    private _createRevision(wi: WitContracts.WorkItem): Models.TCStepsRevisions {
        let _stepsRevision: Models.TCStepsRevisions = new Models.TCStepsRevisions();
        var changedDate: Date = new Date(wi.fields["System.ChangedDate"].toString());

        _stepsRevision.WorkItemId = wi.id.toString();
        _stepsRevision.WorkItemTitle = wi.fields["System.Title"].toString();
        _stepsRevision.RevisionIndex = wi.rev.toString();
        _stepsRevision.Text = changedDate.getFullYear() + "-" + changedDate.getMonth() + "-" + changedDate.getDay() + " " + changedDate.getHours() + ":" + changedDate.getMinutes() + " (" + wi.fields["System.ChangedBy"].toString() + ")";
        _stepsRevision.Steps = [];

        // update steps - de-serialize steps
        if ("Microsoft.VSTS.TCM.Steps" in wi.fields) {
            var stepsXml = wi.fields["Microsoft.VSTS.TCM.Steps"].toString();
            var stepsJson = XmlUtils.xmlToJson(new DOMParser().parseFromString(stepsXml, "text/xml"));
            var s = Object.create(Models.StepsContainer.prototype);
            var TSstepsObj: Models.StepsContainer = Object.assign(s, stepsJson);

            _stepsRevision.Steps = TSstepsObj.steps.step;
        }
        return _stepsRevision;
    }

    /**
    * Invalidate the control's value
    */
    public refresh(): void {
        if (this._model.length > 0) {
            console.log("already have data");
            return;
        }

        console.log("Entered invalidate");
        WitService.WorkItemFormService.getService().then(
            (witService: WitService.IWorkItemFormService) => {
                Q.spread<any, any>([witService.getId(), witService.getRevision()],
                    (id: number, rev: number) => {
                        // if a new work item then exit
                        if (id > 0) {
                            Q.spread<any, any>([RestClient.getClient().getRevisions(id)],
                                (WorkItems: WitContracts.WorkItem[]) => {
                                    //create array the size of all the revisions
                                    this._model = [];

                                    for (var revIndex = 0; revIndex < rev; revIndex++) {
                                        let _TCStepsRevision: Models.TCStepsRevisions = new Models.TCStepsRevisions();
                                        var element: WitContracts.WorkItem = WorkItems[revIndex];
                                        _TCStepsRevision = this._createRevision(element);

                                        // add only revisions with changed steps
                                        if ((this._model.length == 0) ||
                                            (this._model[this._model.length - 1].getSteps() != _TCStepsRevision.getSteps())) {
                                            this._model.push(_TCStepsRevision);
                                        }
                                    }
                                    if (this._model.length > 0) {
                                        this._model = this._model.reverse();
                                        this._model[0].Text = "Current - " + this._model[0].Text
                                        this._view.updateCombos(this._model);
                                    }

                                    // TODO: add copied from revisions...

                                }, this._handleError);
                        }
                        else {
                            console.log("New Work item, id is 0");
                        }
                    }, this._handleError);

                this.resize();
            }, this._handleError);
    }

    private _handleError(error: string): void {
        console.error(error);
        this._view.writeError(error);
    }

    private _handleCompare(left: number, right: number, steps: Models.TCStepsRevisions[]) {
        VSS.getService(VSS.ServiceIds.Dialog).then(function (dialogService: IHostDialogService) {
            var compareForm;
            var extensionCtx = VSS.getExtensionContext();
            // build absolute contribution ID for DialogContent
            var contribId = extensionCtx.publisherId + "." + extensionCtx.extensionId + ".compare-form";

            // open dialog
            var dialogOptions = {
                title: "TestCase " + steps[0].WorkItemId + " - " + steps[0].WorkItemTitle,
                width: 600,
                height: 800,
                getDialogResult: function () {
                    // Get the result from compare-form object
                    return true;
                },
                okCallback: function (result) {
                }
            };

            dialogService.openDialog(contribId, dialogOptions).then(function (dialog: IExternalDialog) {
                // Get registrationForm instance which is registered in registrationFormContent.html
                dialog.getContributionInstance("compare-form").then(function (compareFormInstance: any) {
                    // Keep a reference of registration form instance (to be used above in dialog options)
                    compareForm = compareFormInstance;

                    // Set the initial ok enabled state
                    compareForm.isFormValid().then(function (isValid) {
                        dialog.updateOkButton(isValid);
                    });

                    compareForm.SetData({ V1: steps[left], V2: steps[right] });
                    compareForm.UpdateTable();
                });

                // Set true/false to enable/disable ok button
                dialog.updateOkButton(true);
            });
        });
    }

    protected resize() {
        this._bodyElement = <HTMLBodyElement>document.getElementsByTagName("body").item(0);

        // Cast as any until declarations are updated 
        VSS.resize(null, this._bodyElement.offsetHeight);
    }
}