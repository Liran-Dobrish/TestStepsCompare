export class XmlUtils {
    // https://davidwalsh.name/convert-xml-json
    public static xmlToJson(xml) {
        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    }

    public static stripHtml(htmlText: string) {
        var htmlRegex = new RegExp("<.*?>");
        var HTMLStartTagRegex = new RegExp("<(BLOCKQUOTE|LI|UL|OL|DIV|FONT|A|SPAN|STRONG).*?>");
        var HTMLEndTagRegex = new RegExp("</(BLOCKQUOTE|LI|UL|OL|DIV|P|FONT|A|SPAN|STRONG)>");
        var HTMLstyleRegex = new RegExp("(style|align).*?>");
        var HTMLBRTagRegex = new RegExp("<(P|BR|br).*?>");
        var HTMLnbspRegex = new RegExp("&nbsp;");
        var HTMLquotRegex = new RegExp("&quot;");
        var HTMLltRegex = new RegExp("&lt;");
        var HTMLgtRegex = new RegExp("&gt;");
        var HTMLAmpRegex = new RegExp("&amp;");
        var HTMLcharRegex = new RegExp("&#\d+;");

        //add root
        //string root_html = "<html>" + html + "</html>";
        var root_html = htmlText;
        root_html = root_html.replace(HTMLStartTagRegex, "");
        root_html = root_html.replace(HTMLEndTagRegex, "");
        root_html = root_html.replace(HTMLstyleRegex, ">");
        root_html = root_html.replace(HTMLBRTagRegex, "\r\n");
        //root_html = root_html.replace(HTMLnbspRegex, " ");
        //root_html = root_html.replace(HTMLquotRegex, "\"");
        //root_html = root_html.replace(HTMLltRegex, "<");
        //root_html = root_html.replace(HTMLgtRegex, ">");
        //root_html = root_html.replace(HTMLAmpRegex, "&");
        //root_html = root_html.replace(HTMLcharRegex, "");

        // remove any other tags that may exist
        root_html = root_html.replace(htmlRegex, "");

        return root_html;
    }
}