const fs = require('fs');
const UnlinkFiles = async (filesToDelete) => {
  try {
    if (filesToDelete.length <= 0) {
        return false
    }
    filesToDelete.map(item => {
        fs.unlink(item, (err) => {
            if (err) {
                // console.error('Error deleting file:', err);
                return;
            }
            // console.log('File deleted successfully');
        });
    })
  } catch (error) {
    // console.log(error)
  }
}
module.exports = UnlinkFiles