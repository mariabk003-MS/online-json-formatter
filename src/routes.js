// Every page of the site: [address, page component].
// Used by the browser (main.jsx) and by the build step that writes each page's
// HTML in advance (prerender-entry.js), so the two lists can never differ.
import App from './App.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'
import JsonToCsv from './JsonToCsv.jsx'
import About from './About.jsx'
import CsvToJson from './CsvToJson.jsx'
import JsonValidator from './JsonValidator.jsx'
import JsonErrorsGuide from './JsonErrorsGuide.jsx'
import JsonViewer from './JsonViewer.jsx'
import JsonToXml from './JsonToXml.jsx'
import WhatIsJson from './WhatIsJson.jsx'
import HowToOpenJson from './HowToOpenJson.jsx'
import JsonVsXml from './JsonVsXml.jsx'
import JsonToExcelGuide from './JsonToExcelGuide.jsx'
import JsonCompare from './JsonCompare.jsx'
import JsonSorter from './JsonSorter.jsx'
import JsonToTypescript from './JsonToTypescript.jsx'
import XmlFormatter from './XmlFormatter.jsx'
import YamlFormatter from './YamlFormatter.jsx'
import Base64Tool from './Base64Tool.jsx'
import UrlEncodeTool from './UrlEncodeTool.jsx'
import TextCompare from './TextCompare.jsx'
import XmlToJson from './XmlToJson.jsx'
import JsonToYaml from './JsonToYaml.jsx'
import YamlToJson from './YamlToJson.jsx'
import JsonEscape from './JsonEscape.jsx'
import JsonMinifier from './JsonMinifier.jsx'
import JsonRepair from './JsonRepair.jsx'
import AllTools from './AllTools.jsx'

export const ROUTES = [
  ['/', App],
  ['/privacy-policy', PrivacyPolicy],
  ['/json-to-csv', JsonToCsv],
  ['/about', About],
  ['/csv-to-json', CsvToJson],
  ['/json-validator', JsonValidator],
  ['/common-json-errors', JsonErrorsGuide],
  ['/json-viewer', JsonViewer],
  ['/json-to-xml', JsonToXml],
  ['/what-is-json', WhatIsJson],
  ['/how-to-open-json-file', HowToOpenJson],
  ['/json-vs-xml', JsonVsXml],
  ['/convert-json-to-excel', JsonToExcelGuide],
  ['/json-compare', JsonCompare],
  ['/json-sorter', JsonSorter],
  ['/json-to-typescript', JsonToTypescript],
  ['/xml-formatter', XmlFormatter],
  ['/yaml-formatter', YamlFormatter],
  ['/base64-encode-decode', Base64Tool],
  ['/url-encode-decode', UrlEncodeTool],
  ['/text-compare', TextCompare],
  ['/xml-to-json', XmlToJson],
  ['/json-to-yaml', JsonToYaml],
  ['/yaml-to-json', YamlToJson],
  ['/json-escape', JsonEscape],
  ['/json-minifier', JsonMinifier],
  ['/json-repair', JsonRepair],
  ['/tools', AllTools],
]
