/* eslint-disable */

const fs = require('fs');
const path = require('path');
// import { ColorType } from "./skinChange/color.js"

// const fs = require('fs');
// const path = require('path');

// const { ColorType } = tsMigrate("./src/skinChange/color.ts")
const sourceFolder = './src/renderer'; // 你的源文件夹路径
const outputFolder = './src/renderer/assets/theme'; // 生成的文件夹路径
const outputFile = path.join(outputFolder, 'light.less');
const colorVariables = {};
//16进制颜色代码可以为8、6、4、3位，如：#000、#000000、#0000、#00000000；rgb和rgba
const colorRegx = /#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})|rgba?\([^)]+\)/g;

function findEnumKeyByValue(enumObject, value) {
    return enumObject[value]||null; // 如果未找到匹配的键，可以选择返回 null 或其他自定义的值
}

// 去重
function removeDuplicateValues(obj) {
    const valuesSet = new Set();
    const result = {};

    for (const key in obj) {
        const value = obj[key];
        if (!valuesSet.has(value)) {
            valuesSet.add(value);
            result[key] = value;
        }
    }

    return result;
}

// 递归遍历文件夹下的Less文件
function readLessFilesInFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        if (isDirectory && path.basename(filePath) === 'theme') {
            // 如果是skinChange文件夹，跳过
            return;
        }
        if (isDirectory) {
            readLessFilesInFolder(filePath);
        }
        else if (filePath.endsWith('.less')) {
            processLessFile(filePath);
        }
    });
}

// 处理单个Less文件
function processLessFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const colorMatches = content.match(colorRegx);
    if (colorMatches) {
        colorMatches.forEach(color => {
            // 提取 CSS 属性名
            const cssProperty = extractCssProperty(content, color);
            if (cssProperty) {
                // 生成变量名，结合功能性分类和颜色CSS属性名，将空格和括号替换为下划线
                const variableName = `${cssProperty}_${color.replace(/[#.,() ]/g, '_')}`;
                // 将颜色代码添加到对象中
                colorVariables[variableName] = color;
            }
            else {
                console.log('未匹配属性名的颜色:', color);
            }
        });
    }
}

// 提取颜色相关的 CSS 属性名
function extractCssProperty(content, color) {
    const regex = /([\w-]+)\s*:\s*[^;]*[;\n]?/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const property = match[1];
        if (content.substr(match.index, match[0].length).includes(color)) {
            // 将属性名转换为变量名，并返回
            if (isNaN(Number(property))) {
                return `${property}`;
            }

            return 'color';

        }
    }
    return null;
}

// 生成color.less文件，并按变量名排序
function generateColorLessFile() {
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    // 按变量名（键）排序
    const sortedColors = Object.keys(removeDuplicateValues(colorVariables)).sort();

    const outputContent = sortedColors
        .map(variableName => `--${variableName}: ${colorVariables[variableName]};`)
        .join('\n');

    fs.writeFileSync(outputFile, outputContent);
    console.log('Color variables extracted and saved to color.less.');
}


/** *** 替换变量 *****/

const colorLessFile = './src/renderer/assets/theme/light.less'; // color.less 文件路径
const importLessFile = '/src/renderer/assets/theme/light.less';
const srcFolder = './src/renderer/'; // 你的源文件夹路径

// 读取 color.less 文件，获取颜色变量和值的映射
function readColorLessFile(colorLessPath) {
    if (fs.existsSync(colorLessPath)) {
        const content = fs.readFileSync(colorLessPath, 'utf8');
        const colorVariables = {};

        const variableRegex = /--([\w-]+):\s*([^;]+);/g;
        let match;
        while ((match = variableRegex.exec(content)) !== null) {
            const variableName = match[1];
            const variableValue = match[2];
            colorVariables[variableValue] = variableName;
        }
        return colorVariables;
    }

}

// 替换 Less 文件中的颜色代码为变量名，并引入 color.less 文件
function replaceColorsInLessFile(lessFilePath, colorVariables) {
    const oldContent = fs.readFileSync(lessFilePath, 'utf8');
    let content = oldContent;

    // 匹配文件中的颜色代码
    const colorMatches = content.match(colorRegx);

    // 新增：匹配在linear-gradient后面括号里的颜色代码
    const gradientRegx = /linear-gradient\(([^)]+)\)/i;
    let gradientColors = [];
    const gradientMatches = content.match(gradientRegx);
    if (gradientMatches) {
        gradientMatches.forEach(match => {
            const colorCodes = match.match(colorRegx);
            if (colorCodes) {
                gradientColors = gradientColors.concat(colorCodes);
            }
        });
    }

    if (colorMatches) {
        // 遍历颜色匹配项，进行替换
        //TIP：此处排序是因为需要从最长的到最短的去进行替换，防止出现局部替换颜色代码的情况
        colorMatches.sort((a, b) => b.length - a.length).forEach(colorCode => {
            // 新增：检查颜色代码是否匹配特定的渐变颜色代码，如果匹配则跳过
            if (gradientColors.includes(colorCode)) {
                // console.log(`识别到渐变类型颜色代码： ${colorCode}，已经排除`);
                return;
            }

            const variableName = findEnumKeyByValue(colorVariables, colorCode);
            if (variableName) {
                const colorRegex = new RegExp(`${colorCode}`, 'g');
                content = content.replace(colorRegex, `var(--${variableName})`);
            } else {
                console.log(`识别到颜色代码： ${colorCode}，但colorVariables中未找到匹配项,`,lessFilePath);
            }
        });

        // 写回 Less 文件
        fs.writeFileSync(lessFilePath, content, 'utf8');
    } else {
        // console.log('该路径下未识别到颜色代码：', lessFilePath);
    }
}

// 获取 color.less 文件中的颜色变量和值
const newColorVariables = readColorLessFile(colorLessFile);
console.log("生成的映射：",newColorVariables);

// 遍历 src 文件夹下的所有 Less 文件并替换颜色代码并引入 color.less 文件
function processLessFilesInFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        if (isDirectory && path.basename(filePath) === 'assets' ||
         filePath.includes('src/renderer/.umi') ||
         filePath.includes('src/renderer/utils/icons') || filePath.includes('trtcRoom')||
         filePath.includes('callNotification')||
        filePath.includes('src/renderer/constants/valuesBouquet')||
        filePath.includes("src/renderer/constants/AvatarChange")||
        filePath.includes("src/renderer/pages/calendar/components/meetingRoomSelect")||
        filePath.includes("src/renderer/pages/components/flowers/utils.ts")||
        filePath.includes("src/renderer/pages/extractText/components/results/config.ts")||
        filePath.includes("src/renderer/utils/nim/")||
        filePath.includes("src/renderer/utils/todo/todoConfig.ts")||
        filePath.includes("src/renderer/models/watermark.ts")||
        filePath.includes("src/renderer/pages/components/flowers/utils.ts")||
        filePath.includes("src/renderer/config")||
        filePath.includes("/flowers/weeklyFlowers.tsx")
        ) {
            // 如果是skinChange文件夹，跳过
            return;
        }
        if (isDirectory) {
            processLessFilesInFolder(filePath);
        }
        else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.ts')) {
            replaceColorsInLessFile(filePath, newColorVariables, colorLessFile);
        }
    });
}


/** **提取tsx，jsx，js，ts，文件中的颜色变量 */

const colorEnumName = 'ColorType';
const projectFolder = './src/renderer/';

// 递归遍历文件夹下的tsx，jsx，js，ts文件
function readUnStyledFilesInFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(folderPath, file);
        if (filePath.includes('src/renderer/.umi') ||
            filePath.includes('src/renderer/utils/icons')||
            path.basename(filePath) === 'assets' ||
             filePath.includes('src/renderer/.umi') ||
             filePath.includes('src/renderer/utils/icons') ||
             filePath.includes('trtcRoom')||
             filePath.includes('callNotification')) {
            continue;
        }
        if (fs.statSync(filePath).isDirectory()) {
            readUnStyledFilesInFolder(filePath);
        }
        else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.ts')) {
            processUnStyledFile(filePath);
        }
    }
}

// 处理单个文件
function processUnStyledFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // 使用正则表达式匹配颜色编码，可以根据需要进行调整
    const colorMatches = content.match(colorRegx);
    if (colorMatches) {
        colorMatches.forEach(color => {
            // 提取 CSS 属性名
            const cssProperty = extractCssProperty(content, color);
            // 生成变量名，结合功能性分类和颜色CSS属性名，将空格和括号替换为下划线
            const variableName = `${(cssProperty || "color").replace(/[ -]/g, '_')}_${path.basename(filePath).replace(/[ -#.,()]/g, '_')}${color.replace(/[ #.,()]/g, '_')}`;
            // 将颜色代码添加到对象中
            colorVariables[variableName] = color;
        });
    }
}

// 生成color.ts文件
function generateColorTSFile() {
    const reDuplicateVariables = removeDuplicateValues(colorVariables);
    // 按变量名排序
    const sortedColorVariables = Object.keys(reDuplicateVariables).sort();
    const outputFile = path.join(outputFolder, 'color.ts');
    let outputContent = `//路径:${projectFolder}\n//命名：属性名+文件名+颜色代码\nexport enum ${colorEnumName} {\n`;
    outputContent = `${outputContent + sortedColorVariables.map(variableName =>
        `  ${variableName} = '${colorVariables[variableName]}'`).join(',\n')}}`;
    fs.writeFileSync(outputFile, outputContent, 'utf8');
    console.log('Color variables extracted and saved to color.ts.');
}

/** 读取color.ts替换项目中tsx，jsx，js，ts中的颜色代码 */

// 遍历项目文件夹中的所有文件（假设项目文件夹为 projectFolder）
const colorFilePath = './src/renderer/skinChange/color.ts';
const importTsFile = '@/skinChange/color.ts';

function formatColorVariables(colorFilePath = './src/skinChange/color.ts') {
    // 读取 TypeScript 文件
    try {
        // 同步读取 TypeScript 文件
        const data = fs.readFileSync(colorFilePath, 'utf8');

        // 使用正则表达式匹配枚举内容
        const enumRegex = new RegExp(`export\\s+enum\\s+${colorEnumName}\\s*{([^}]*)}`, 'g');
        const match = data.match(enumRegex);
        if (match) {
            const enumContent = match[0];

            // 使用正则表达式匹配枚举项
            const enumItemRegex = /(\w+)\s*=\s*['"]?([^'"]+)['"]?/g;


            let item;
            while ((item = enumItemRegex.exec(enumContent)) !== null) {
                const [, key, value] = item;
                colorVariables[key] = value;
            }
            processFolder(projectFolder);
            // console.log(colorVariables);
        }
        else {
            console.error('Enum not found in the TypeScript file.');
        }
    }
    catch (err) {
        console.error(err);
    }
}

function processFile(filePath) {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    // #([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})|rgba?\([^)]+\)
    const regex = /(['"]([^'"]*#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})|rgba?\([^)]+\)[^'"]*)['"])/g;
    let modifiedContent = content.replace(regex, match => {
        let single = true;
        let matchSuccess = false;
        // 非单一的颜色和路径
        if (match.match(colorRegx) && (match.match(colorRegx)[0].length + 2 < match.length)) {
            single = false;
        }
        let matchContent = match.replace(colorRegx, match => {
            const colorVariable = findEnumKeyByValue(colorVariables, match);
            if (colorVariable) {
                matchSuccess = true;
                return single ? `${colorEnumName}.${colorVariable}` : '$' + `{${colorEnumName}.${colorVariable}}`;
            }
            // console.log(colorVariable);
            return match;
        });
        if (matchSuccess) {
            // console.log('匹配属性名的颜色&路径:', match, filePath);

            matchContent = matchContent.replace(/['"]/g, single ? '' : '`');
        }
        else {
            console.log('未匹配属性名的颜色&路径:', match, filePath);
        }
        return matchContent;
    });
    // 在 文件开头添加 import 语句
    const importContent = modifiedContent === content ? '' : `import { ${colorEnumName} } from "${importTsFile}";\n`;
    modifiedContent = `${importContent}${modifiedContent}`;
    // 写回修改后的内容
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
}

function processFolder(folderPath) {
    const files = fs.readdirSync(folderPath);

    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        if (isDirectory && (filePath.includes('src/renderer/.umi') ||
            filePath.includes('src/renderer/utils/icons') ||
            filePath.includes('src/renderer/config') ||
            filePath.includes('src/renderer/skinChange'))) {
            return;
        }

        if (isDirectory) {
            processFolder(filePath);
        }
        else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.ts')) {
            // 处理文件
            processFile(filePath);
        }
    });
}

/****css文件变量提前 */
function extractColorVariables(filePath) {
    let cssContent = fs.readFileSync(filePath, 'utf8');
    const colorPattern = colorRegx;
    const colorVariables = {};

    let match;
    while ((match = colorPattern.exec(cssContent)) !== null) {
        const colorCode = match[0];
        const propertyName = extractCssProperty(cssContent, colorCode);
        const key = `${propertyName}_${colorCode}`;
        const formattedKey = `--${key.replace(/_#/g, '-')}`;
        cssContent = cssContent.replace(colorCode, `var(${formattedKey})`)
        colorVariables[formattedKey] = colorCode;
    }

    return { colorVariables, cssContent };
}

function formatColorVariablesForRoot(colorVariables) {
    let formattedVariables = ':root {';

    for (const key in colorVariables) {
        if (colorVariables.hasOwnProperty(key)) {
            // 格式化变量名
            const value = colorVariables[key];

            formattedVariables += ` ${key}: ${value};`;
        }
    }

    formattedVariables += ' }';

    return formattedVariables;
}

function writeFormattedVariablesToFile(filePath, formattedVariables, cssContent) {
    // 读取原始CSS内容
    const originalContent = cssContent;

    // 将格式化后的变量插入到原始内容的最开始
    const newContent = `${formattedVariables}\n\n${originalContent}`;

    // 写入到新的CSS文件中
    fs.writeFileSync(filePath, newContent, 'utf8');
}

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askUserForChoice() {
    rl.question(
        '1:提取less颜色变量\n2:替换less文件中颜色变量\n3:提取行内样式变量（tsx，jsx，js，ts，支持屏蔽）\n4:替换行内样式文件（tsx，jsx，js，ts，支持屏蔽）\n5:单个css文件变量提前+替换\n请选择一个选项: ',
        choice => {
            if (choice === '1') {
                console.log('你选择了选项 1');
                // 开始遍历和处理Less文件
                readLessFilesInFolder(sourceFolder);
                generateColorLessFile();
                console.log('Color codes replaced with variables and color.less imported in Less files.');
            }
            else if (choice === '2') {
                // 开始遍历和替换 Less 文件中的颜色代码并引入 color.less 文件
                processLessFilesInFolder(srcFolder);
            }
            else if (choice === '3') {
                // 开始遍历非样式文件，生成color.ts
                console.log('你选择了选项 3');
                readUnStyledFilesInFolder(projectFolder);
                generateColorTSFile();
            }
            else if (choice === '4') {
                console.log('你选择了选项 4');
                // 读取 color.ts 文件并解析颜色变量
                formatColorVariables(colorFilePath);
            }
            else if (choice === '5') {
                console.log('你选择了选项 5');
                // 读取指定的CSS文件
                const filePath = './src/renderer/components/SRQuillEditor/quill-image-uploader/quill.imageUploader.css';

                // 提取颜色变量
                const { colorVariables, cssContent } = extractColorVariables(filePath);

                // 格式化颜色变量
                const formattedVariables = formatColorVariablesForRoot(colorVariables);

                // 将格式化后的变量写入到文件中
                writeFormattedVariablesToFile(filePath, formattedVariables, cssContent);
            }
            else {
                console.log('无效的选项，请重新选择。');
            }

            rl.close();
        }
    );
}

askUserForChoice();
