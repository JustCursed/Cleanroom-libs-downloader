const fs = require('fs');
const { Readable } = require('stream');

const downloadFile = async (url, file) => {
	try {
		const resp = await fetch(url);

		if (resp.ok && resp.body) {
			const filePath = `./libraries/${file.split('/').slice(0, -1).join('/')}`;
			await fs.promises.mkdir(filePath, { recursive: true });
			console.log(`downloading ${file}`);

			let writer = fs.createWriteStream(`./libraries/${file}`);
			Readable.fromWeb(resp.body).pipe(writer);
		}
	} catch (error) {
		console.error(`Error downloading ${url}:`, error);
	}
};

const downloadFromJson = async name => {
	console.log(`started ${name}`);

	for (const elem of require(name).libraries) {
		const artifact = elem?.downloads?.artifact;

		if (artifact?.url && artifact?.path)
			await downloadFile(artifact.url, artifact.path);
		else if (artifact?.url && elem.name) {
			let pt = elem.name.split(':').map((el, i) => i == 0 ? el.split('.').join('/') : el).join('/');
			const classifiers = elem.downloads.classifiers;
			if (classifiers) {
				for (const nativ in classifiers) {
					await downloadFile(classifiers[nativ].url, `${pt}/${classifiers[nativ].url.split('/').at(-1)}`);
				}
			}
			await downloadFile(artifact.url, `${pt}/${artifact.url.split('/').at(-1)}`);
		}
	}
};

(async () => {
	const minecraftName = fs.readdirSync('./libraries').find(el => el.endsWith('.jar'));
	fs.renameSync(`./libraries/${minecraftName}`, './libraries/forge.jar');

	await downloadFromJson('./patches/net.minecraftforge.json');
	await downloadFromJson('./patches/net.minecraft.json');
	await downloadFromJson('./patches/org.lwjgl3.json');
})();
