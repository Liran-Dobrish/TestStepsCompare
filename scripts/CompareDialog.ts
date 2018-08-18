//https://www.visualstudio.com/en-us/docs/integrate/extensions/develop/ui-controls/modaldialogo
//import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";
import * as Models from "./model";
import { XmlUtils } from "./XmlUtils"

var compareForm = () => {
    var callbacks = [];
    var data: Models.CompareData;

    function inputChanged() {
        console.log("inputChanged");
        // Execute registered callbacks
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](isValid());
        }
    }

    function isValid() {
        // Check whether form is valid or not
        return true;
    }

    function SetData(stepsData: Models.CompareData) {
        data = stepsData;
    }

    function getStep(step: Models.JsonStep) {
        let action: string = "";
        let expected: string = "";
        if (typeof step.parameterizedString[0]["text"] === "undefined") {
            action = step.parameterizedString[0]["#text"];
        }
        else {
            action = step.parameterizedString[0]["text"]["#text"];
        }

        if (typeof step.parameterizedString[1]["text"] === "undefined") {
            expected = step.parameterizedString[1]["#text"];
        }
        else {
            expected = step.parameterizedString[1]["text"]["#text"];
        }

        return [action, expected];
    }

    function getStepsCount(stepsObj: any): number {
        if (Array.isArray(stepsObj)) {
            return stepsObj.length;
        }

        return 1;
    }

    function UpdateTable() {
        $("#thV1Rev").html(data.V1.RevisionIndex + ": " + data.V1.Text);
        $("#thV2Rev").html(data.V2.RevisionIndex + ": " + data.V2.Text);
        $("#thV1Title").html(data.V1.WorkItemTitle);
        $("#thV2Title").html(data.V2.WorkItemTitle);

        var V1StepsCount = getStepsCount(data.V1.Steps);
        var V2StepsCount = getStepsCount(data.V2.Steps);

        var minSteps = Math.min(V1StepsCount, V2StepsCount);
        var tableRows = (<HTMLTableSectionElement>$("#compareTableBody")[0]);
        //common steps
        for (var stepIndex = 0; stepIndex < minSteps; stepIndex++) {
            var step1: string[];
            var step2: string[];
            if (Array.isArray(data.V1.Steps)) {
                step1 = getStep(data.V1.Steps[stepIndex]);
            } else {
                step1 = getStep(data.V1.Steps);
            }

            if (Array.isArray(data.V2.Steps)) {
                step2 = getStep(data.V2.Steps[stepIndex]);
            } else {
                step2 = getStep(data.V2.Steps);
            }

            var row = tableRows.insertRow(-1); // add last
            var action1 = XmlUtils.stripHtml(step1[0]);
            var action2 = XmlUtils.stripHtml(step2[0]);
            var expected1 = XmlUtils.stripHtml(step1[1]);
            var expected2 = XmlUtils.stripHtml(step2[1]);

            row.insertCell(0).innerHTML = (stepIndex + 1).toString();
            row.insertCell(1).innerHTML = action1;
            row.insertCell(2).innerHTML = expected1;
            row.insertCell(3).innerHTML = action2;
            row.insertCell(4).innerHTML = expected2;

            if ((action1 + ";" + expected1) != (action2 + ";" + expected2)) {
                row.classList.add("diffStep");
            }
        }

        // add steps found in V1
        if (V1StepsCount > V2StepsCount) {
            for (var stepIndex = minSteps; stepIndex < data.V1.Steps.length; stepIndex++) {
                var step: string[] = getStep(data.V1.Steps[stepIndex]);
                var row = tableRows.insertRow(-1); // add last
                var action1 = XmlUtils.stripHtml(step[0]);
                var action2 = "";
                var expected1 = XmlUtils.stripHtml(step[1]);
                var expected2 = "";

                row.insertCell(0).innerHTML = (stepIndex + 1).toString();
                row.insertCell(1).innerHTML = action1;
                row.insertCell(2).innerHTML = expected1;
                row.insertCell(3).innerHTML = action2;
                row.insertCell(4).innerHTML = expected2;

                row.classList.add("newStep");
            }
        }

        // add steps found in V2
        if (V1StepsCount < V2StepsCount) {
            for (var stepIndex = minSteps; stepIndex < data.V2.Steps.length; stepIndex++) {
                var step: string[] = getStep(data.V2.Steps[stepIndex]);
                var row = tableRows.insertRow(-1); // add last
                var action1 = "";
                var action2 = XmlUtils.stripHtml(step[0]);
                var expected1 = "";
                var expected2 = XmlUtils.stripHtml(step[1]);

                row.insertCell(0).innerHTML = (stepIndex + 1).toString();
                row.insertCell(1).innerHTML = action1;
                row.insertCell(2).innerHTML = expected1;
                row.insertCell(3).innerHTML = action2;
                row.insertCell(4).innerHTML = expected2;

                row.classList.add("newStep");
            }
        }
    }

    return {
        isFormValid: function () {
            return isValid();
        },
        attachFormChanged: function (cb) {
            callbacks.push(cb);
        },
        UpdateTable: function () {
            return UpdateTable();
        },
        SetData: function (stepsData) {
            return SetData(stepsData);
        }
    };
}

// register the events
VSS.register("compare-form", compareForm);