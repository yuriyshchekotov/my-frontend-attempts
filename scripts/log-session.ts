#!/usr/bin/env ts-node

import * as fs from "fs";
import * as path from "path";
import inquirer from "inquirer";
import dayjs from "dayjs";

const dataDir = path.join(process.cwd(), "data");
const csvFile = path.join(dataDir, "progress.csv");

async function main() {
    const today = dayjs().format("YYYY-MM-DD");

    // 1. День курса
    const { dayNumber } = (await inquirer.prompt([
        {
            type: "input", // заменим "number" на input, а потом сами приведём к числу
            name: "dayNumber",
            message: "Какой это день из курса?",
            validate: (n: string) =>
                Number(n) > 0 ? true : "Нужно число больше 0",
        },
    ] as any)) as { dayNumber: string };
    const dayNumInt = Number(dayNumber);

    const dayStr = `day-${String(dayNumInt).padStart(2, "0")}`;
    const dayPath = path.join(dataDir, "days", dayStr);

    // 2. Тема
    const { topic } = (await inquirer.prompt([
        { type: "input", name: "topic", message: "Какая была тема занятия?" },
    ] as any)) as { topic: string };

    // 3. Тип занятия
    const { sessionType } = (await inquirer.prompt([
        {
            type: "list",
            name: "sessionType",
            message: "Какой был тип занятия?",
            choices: ["чтение", "кодинг", "мини-проект", "повторение"],
        },
    ] as any)) as { sessionType: string };

    // 4. Результат практики
    const { practice } = (await inquirer.prompt([
        { type: "input", name: "practice", message: "Кратко опиши результат:" },
    ] as any)) as { practice: string };

    // 5. Ссылки на файлы
    let files: string[] = [];
    if (fs.existsSync(dayPath)) {
        const availableFiles = fs.readdirSync(dayPath);
        if (availableFiles.length > 0) {
            const { chosenFiles } = (await inquirer.prompt([
                {
                    type: "checkbox",
                    name: "chosenFiles",
                    message: "Включить ссылки на файлы?",
                    choices: availableFiles,
                    default: availableFiles,
                },
            ] as any)) as { chosenFiles: string[] };
            files = chosenFiles.map(f => path.join(dayPath, f));

        }
    }

    // 6. Уверенность
    const { confidence } = (await inquirer.prompt([
        {
            type: "list",
            name: "confidence",
            message: "Насколько оцениваешь уверенность?",
            choices: ["1", "2", "3", "4", "5"],
        },
    ] as any)) as { confidence: string };

    // 7. Повторить?
    const { repeat } = (await inquirer.prompt([
        {
            type: "list",
            name: "repeat",
            message: "Нужно ли повторить?",
            choices: ["Да", "Нет"],
        },
    ] as any)) as { repeat: string };

    // 8. Комментарий
    let comment = "";
    if (repeat === "Да") {
        const { c } = (await inquirer.prompt([
            { type: "input", name: "c", message: "Комментарий:" },
        ] as any)) as { c: string };
        comment = c;
    }

    // Формируем строку
    const row = [
        today,
        dayStr,
        topic,
        sessionType,
        practice,
        files.join(", "),
        confidence,
        repeat,
        comment,
    ].join(" | ");

    // Проверяем заголовки
    if (!fs.existsSync(csvFile)) {
        const header =
            "Дата | День курса | Тема | Тип | Результат практики | Файлы | Уверенность (1-5) | Повторить? | Комментарии";
        fs.writeFileSync(csvFile, header + "\n", "utf8");
    }

    fs.appendFileSync(csvFile, row + "\n", "utf8");
    console.log("✅ Запись добавлена в", csvFile);
}

main();
