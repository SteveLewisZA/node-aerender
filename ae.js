import { spawn } from "child_process";
import path from 'path';

export default function (AEPath, config, progress) {
    return new Promise((resolve, reject) => {

        let renderConfig = [];
        for (const [key, value] of Object.entries(config)) {
            let val = value.toString();
            if (["project", "comp", "OMtemplate", "RStemplate", "output", "log"].includes(key)) {
                val = `"${value}"`;
            }
            if (["reuse", "continueOnMissingFootage"].includes(key)) {
                if (value) {
                    renderConfig.push(`-${key}`);
                }
            } else {
                renderConfig.push(`-${key}`);
                renderConfig.push(val);
            }
        }

        let ae = spawn(path.join(AEPath, 'aerender'), renderConfig);

        const progressRegex = /([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})\s+(\(\d+\))/gi;
        const durationRegex = /Duration:\s+([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})/gi;
        const startRegex = /Start:\s+([\d]{1,2}:[\d]{2}:[\d]{2}:[\d]{2})/gi;
        const errorRegex = /aerender Error:\s*(.*)$/gis;

        const seconds = (string) => string.split(':')
            .map((e, i) => (i < 3) ? +e * Math.pow(60, 2 - i) : +e * 10e-6)
            .reduce((acc, val) => acc + val);

        let projectDuration = null;
        let currentProgress = null;
        let previousProgress = undefined;
        let projectStart = null;
        let matchError = null;

        const parseProgress = (data) => {
            const string = data.toString('utf8').replace(/;/g, ':');
            const matchStart = isNaN(parseInt(projectStart)) ? startRegex.exec(string) : false;
            const matchDuration = isNaN(parseInt(projectDuration)) ? durationRegex.exec(string) : false;
            const matchProgress = !isNaN(parseInt(projectDuration)) ? progressRegex.exec(string) : null;
            projectDuration = (matchDuration) ? seconds(matchDuration[1]) : projectDuration;
            projectStart = (matchStart) ? seconds(matchStart[1]) : projectStart;

            if (progress && matchProgress) {
                currentProgress = Math.ceil((seconds(matchProgress[1]) - projectStart) * 100 / projectDuration);
                if (previousProgress !== currentProgress) {
                    progress(currentProgress);
                    previousProgress = currentProgress;
                }
            }

            matchError = errorRegex.exec(string);

            return data;
        }

        ae.stdout.on('data', function (data) {
            parseProgress(data.toString('utf8'));
        });

        ae.on('close', function (code) {
            if (matchError !== null) {
                reject(matchError);
            } else {
                resolve();
            }
        });
    });
}