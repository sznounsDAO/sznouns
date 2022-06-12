import Jimp from 'jimp';
import { promises as fs } from 'fs';
import path from 'path';

const flip = async () => {
  const partfolders = ['1-bodies', '2-accessories', '3-heads', '4-glasses'];
  for (const folder of partfolders) {
    const folderpath = path.join(__dirname, '../images', folder);
    const newPath = path.join(__dirname, '../flipped', folder);
    const files = await fs.readdir(folderpath);
    for (const file of files) {
      Jimp.read(path.join(folderpath, file), (err, lenna) => {
        if (err) throw err;
        lenna.flip(true, false).write(path.join(newPath, file)); // save
      });
    }
  }
};

flip();
