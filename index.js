const fs = require('fs');
const { Readable } = require('stream');

const downloadFile = async (url, file) => {
	try {
		const resp = await fetch(url);

		if (resp.ok && resp.body) {
			console.log(`./libs/${file.split('/').slice(0, -1).join('/')}`);
			await fs.promises.mkdir(`./libs/${file.split('/').slice(0, -1).join('/')}`, { recursive: true });
			let writer = fs.createWriteStream(`./libs/${file}`);
			Readable.fromWeb(resp.body).pipe(writer);
		}
	} catch (error) {
		console.error(`Error downloading ${url}:`, error);
	}
};

const downloadFromJson = async name => {
	for (const elem of require(name).libraries) {
		const artifact = elem?.downloads?.artifact;

		if (artifact?.url && artifact?.path)
			await downloadFile(artifact.url, artifact.path);
	}
};

(async () => {
	await downloadFromJson('./patches/net.minecraftforge.json');
	await downloadFromJson('./patches/net.minecraft.json');
	await downloadFromJson('./patches/org.lwjgl3.json');
})();

