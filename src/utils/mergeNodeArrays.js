
/**
 * @name mergeNodeArrays
 * @summary - merge and remove repeated nodes
 * @returns {<Array[String]>} - return a list of merged nodes
 */
export default function mergeNodeArrays(nodes) {
    const list = [];

    for (var node of nodes) {
        for (var item of node.name) {

            if (Array.isArray(item)) {
                for (var subItem of item) {
                    const matches = list.find((element) => element.name == subItem);

                    if (!matches) list.push({ name: subItem });
                }
            }
            else {
                const matches = list.find((element) => element.name == item);

                if (!matches) list.push({ name: item });
            }
        }
    }

    return list;
}
