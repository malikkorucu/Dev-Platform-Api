const express = require("express");
const router = express.Router();
const user = require("../controllers/user");
const { getAccessToRoute, checkPermission } = require("../middlewares/auth/auth");
const upload = require("../middlewares/libraries/imageUpload");


router.post("/edit",getAccessToRoute,checkPermission("profile","update"),user.editProfile)
router.put("/profile-image",getAccessToRoute,checkPermission("profile","update"),upload.array("file",1),user.uploadProfileImage)
// router.get("/get/:id",getAccessToRoute,checkPermission("role","read","employee"),role.getRoleById)
// router.put("/update",getAccessToRoute,checkPermission("role","update","employee"),role.updateRole)
// router.delete("/delete",getAccessToRoute,checkPermission("role","delete","employee"),role.deleteRole)
// router.put("/change-user-default-role",checkPermission("role","update","employee"),getAccessToRoute,role.changeUserDefaultRole)


module.exports = router;