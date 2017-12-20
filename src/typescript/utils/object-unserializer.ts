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
