import { TCStepsVersionControlController } from "./TCStepsVersionControl";
import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

// save on ctr + s
$(window).bind("keydown", function (event: JQueryEventObject) {
    if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which) === "S") {
            event.preventDefault();
            WorkItemFormService.getService().then((service) => service.beginSaveWorkItem($.noop, $.noop));
            control.invalidate();
        }
    }
});

var control: TCStepsVersionControlController;

var provider= () => {
    var ensureControl = () => {
        if (!control) {
            control = new TCStepsVersionControlController();
            control.initialize();
        }

        control.invalidate();
    }

    return {
        onLoaded: (workItemLoadedArgs: ExtensionContracts.IWorkItemLoadedArgs) => {
            // create a new controller when work item is loaded
            ensureControl();
        },
        onUnloaded: (args: ExtensionContracts.IWorkItemChangedArgs) => {
            if (control) {
                control.clear();
            }
        }
        // onFieldChanged: (fieldChangedArgs: ExtensionContracts.IWorkItemFieldChangedArgs) => {
        //     // when ever a field is changed update the control
        //     var changedValue = fieldChangedArgs.changedFields[control.getFieldName()];
        //     if (changedValue !== undefined) {
        //         control.updateExternal(changedValue);
        //     }
        // }
    }
}

// register the events
VSS.register(VSS.getContribution().id, provider);