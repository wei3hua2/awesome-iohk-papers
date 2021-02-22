const _ = require("lodash");
const fs = require("fs");
const dayjs = require("dayjs");
const { reverse } = require("lodash");


// https://iohk.io/page-data/en/research/library/page-data.json
const readPapers = () => JSON.parse(fs.readFileSync("./data/papers.json","utf8")).result.pageContext.items;

const getAllAuthors = () => _.chain(readPapers()).map("creators").flatten().uniqBy("key").value();
const getAllTags = () => _.chain(readPapers()).map("tags").flatten().uniq().value();
const getAllProceedings = () => _.chain(readPapers()).map("proceedingsTitle").uniq().value();
const getAllConferenceName = () => _.chain(readPapers()).map("conferenceName").uniq().value();
const getAllTypes = () => _.chain(readPapers()).map("type").uniq().value();


const getYear = (dateStr) => dayjs(dateStr).year(); 



const byTypes = () => _.chain(getAllTypes())
    .map( t => _.filter(readPapers(), p=>p.type==t))
    .map(pList => ({title:pList[0].type, list:pList}))
    .value();

const byTags = () => _.chain(getAllTags())
    .map( tag =>  ({title:tag, list: _.filter(readPapers(), p=>_.includes(p.tags,tag)) }) )
    .value();

const byAuthors = () => _.chain(getAllAuthors())
    .map(author => ({title:author.name, list: _.flatten(_.filter(readPapers(), p => _.find(p.creators, c=>c.key==author.key) )) }) )
    .sortBy(a => a.list.length)
    .reverse()
    .value();

const byYears = () => _.chain(readPapers())
    .groupBy( paper => getYear(paper.dateAdded) )
    .map( (val, year) => ({title:year, list:val}) )
    .reverse()
    .value();


const formatPaper = (paperItem) => `
- ${paperItem.title} ${paperItem.url ? '[link]('+paperItem.url+')' : ''}  

${paperItem.abstractNote}
`

const formatSection = (group) => `
## ${group.title}
${_.map(group.list, formatPaper).join("")}
---
`
const formatGroup = (title, groups) => `
# ${title}
---
## Table of Contents
${_.map(groups, g => '- ['+g.title+'](#'+g.title+')').join('\n')}
---
${_.map(groups, formatSection).join("")}
`


const types = byTypes();
const tags = byTags();
const authors = byAuthors()
const years = byYears();



var content = formatGroup('Sort By Types', types);
fs.writeFileSync("../sort_by_type.md",content);

content = formatGroup('Sort By Tags', tags);
fs.writeFileSync("../sort_by_tags.md",content);

content = formatGroup('Sort By Authors', authors);
fs.writeFileSync("../sort_by_authors.md",content);

content = formatGroup('Sort By Years', years);
fs.writeFileSync("../sort_by_year.md", content);




// console.log(content);

