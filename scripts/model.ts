export class TCStepsRevisions {
    public Text: string;
    public WorkItemId: string;
    public WorkItemTitle: string;
    public RevisionIndex: string;
    public Steps: JsonStep[];

    constructor() { }

    public toString(): string {
        return this.RevisionIndex + ": " + this.Text;
    }

    private createStep(element: JsonStep): string {
        let action: string = "";
        let expected: string = "";
        if (typeof element.parameterizedString[0]["text"] === "undefined") {
            action = element.parameterizedString[0]["#text"];
        }
        else {
            action = element.parameterizedString[0]["text"]["#text"];
        }

        if (typeof element.parameterizedString[1]["text"] === "undefined") {
            expected = element.parameterizedString[1]["#text"];
        }
        else {
            expected = element.parameterizedString[1]["text"]["#text"];
        }

        return "\r\n" + action + ":" + expected;
    }

    // getSteps
    public getSteps(): string {
        let result: string = "";
        if (Array.isArray(this.Steps)) {
            this.Steps.forEach((element) => {
                result += this.createStep(element);
            });
        } else {
            this.createStep(this.Steps);
        }

        return result;
    }
}

export class StepsContainer {
    public steps: JsonSteps;
}

export class StepsAttributes {
    public id: string;
    public last: string;
}

export class StepAttributes {
    public id: string;
    public type: string;
}

export class JsonStep {
    public attributes: StepAttributes;
    public description;
    public parameterizedString: string[];
}

export class JsonSteps {
    public attributes: StepsAttributes;
    public step: JsonStep[];
}

export class CompareData {
    public V1: TCStepsRevisions;
    public V2: TCStepsRevisions;
}