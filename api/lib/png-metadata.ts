import png from 'png-metadata'
import fs from 'fs'

// This module allows reading and writing of png metadata
// common values for keys are (from png docs):

// * Title: Short (one line) title or caption for image
// * Author: Name of image's creator
// * Description: Description of image (possibly long)
// * Copyright: Copyright notice
// * Creation Time: Time of original image creation
// * Software: Software used to create the image
// * Disclaimer: Legal disclaimer
// * Warning: Warning of nature of content
// * Source: Device used to create the image
// * Comment: Miscellaneous comment; conversion from

// values can be a string or an array of strings

// e.g.
// console.log(readMetadata('./downloads/sd182935.png'));

// e.g.
// console.log(setMetadata('./downloads/sd182935.png', { 
//     'Title': ['woo hoo', 'haha'],
//     'Author': 'Bilbo Baggins!',
//     'foo': undefined
// }));

export function readMetadata(filePath) {
    const file = png.readFileSync(filePath)
    const chunks = png.splitChunk(file);
    const metadataRaw = chunks.filter(x => x.type === 'tEXt')
    const metadataList = metadataRaw.map(x => x.data.split('\0'))
    const metadata = {}

    metadataList.forEach((item) => {
        let value = item[1]
        if (value[0] === '{') {
            value = JSON.parse(value)
        }
        if (metadata[item[0]]) {
            const values = Array.isArray(metadata[item[0]]) ? metadata[item[0]] : [metadata[item[0]]]
            values.push(value)
            metadata[item[0]] = values
        } else {
            metadata[item[0]] = value
        }
    });
    return metadata
}

export function setMetadata(filePath, metadata) {
    const savedMetadata = readMetadata(filePath)
    const newMetadata = Object.assign({}, savedMetadata, metadata)
    if (JSON.stringify(newMetadata) === JSON.stringify(savedMetadata)) return false
    
    const file = png.readFileSync(filePath)
    const chunks = png.splitChunk(file);
    const newChunks: any[] = []
    
    chunks.forEach(chunk => {
        if (chunk.type !== 'tEXt' || chunk.data.split('\0').length !== 2) {
            newChunks.push(chunk)
        }
    })
    
    const iend = newChunks.pop(); 
    for(let key in newMetadata) {
        if (newMetadata[key]) {
            const values = Array.isArray(newMetadata[key]) ? newMetadata[key] : [newMetadata[key]]
            values.forEach(value => {
                if (typeof value === 'object') {
                    const newChunk = png.createChunk("tEXt",`${key}\0${JSON.stringify(value)}`);
                    newChunks.push(newChunk)        
                } else{
                    const newChunk = png.createChunk("tEXt",`${key}\0${value}`);
                    newChunks.push(newChunk)        
                }
            })
        }
    }
    newChunks.push(iend);
    const newPng = png.joinChunk(newChunks)
    fs.writeFileSync(filePath, newPng, 'binary');
    return true
}

