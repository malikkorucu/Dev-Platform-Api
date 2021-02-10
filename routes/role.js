const express = require("express");
const router = express.Router();
const role = require("../controllers/role");
const { getAccessToRoute, checkPermission } = require("../middlewares/auth/auth");

// router.post("/new",getAccessToRoute,checkPermission("role","create","employee"),role.newRole)
// router.post("/new",getAccessToRoute,checkPermission("role","create","employee"),role.newRole)
router.post("/new",getAccessToRoute,role.newRole)
router.get("/get/:id",getAccessToRoute,checkPermission("role","read","employee"),role.getRoleById)
router.put("/update",getAccessToRoute,checkPermission("role","update","employee"),role.updateRole)
router.delete("/delete",getAccessToRoute,checkPermission("role","delete","employee"),role.deleteRole)
router.put("/change-user-default-role",checkPermission("role","update","employee"),getAccessToRoute,role.changeUserDefaultRole)


module.exports = router;