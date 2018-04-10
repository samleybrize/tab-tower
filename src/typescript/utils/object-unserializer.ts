interface ClassObject {
    name: string;
    new(...args: any[]): any;
}

export class ObjectUnserializer {
    private classMap = new Map<string, ClassObject>();

    addSupportedClasses(classList: ClassObject[]) {
        for (const classObject of classList) {
            this.classMap.set(classObject.name, classObject);
        }
    }

    addSupportedClassesFromImportObject(importObject: object) {
        const classList = Object
            .getOwnPropertyNames(importObject as Record<string, ClassObject>)
            .map((key) => (importObject as Record<string, ClassObject>)[key])
        ;

        this.addSupportedClasses(classList);
    }

    fromClassNameAndData(className: string, data: object): object {
        const classObject = this.classMap.get(className);

        if (null == classObject) {
            return;
        }

        const newObject = new classObject();
        Object.assign(newObject, data);

        return newObject;
    }
}
