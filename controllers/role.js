const asyncHandler = require('express-async-handler');
const CustomError = require('../helpers/error/CustomError');
const Role = require('../models/Role');
const User = require('../models/User');

exports.newRole = asyncHandler(async(req,res,next)=>{
    const {role} = req.body;
    if(!role) return next(new CustomError("Rol için isim belirlenmemiş",400));
    let newRole = new Role({
        role,
        ...req.body
    });
    newRole = await newRole.save();
    res.status(200).json({
        success: true,
        data: newRole
    })
});

exports.getRoleById = asyncHandler(async(req,res,next)=>{
    const {id} = req.params;
    if(!id) return next(new CustomError("Rol için gerekli parametre gelmedi",400));
    const role =await Role.findById(id).select("+employee_permission");
    if(!role) return next(new CustomError("Rol Bulunamadı",400));
    res.status(200).json({
        success: true,
        data: role
    })
})

exports.updateRole = asyncHandler(async(req,res,next)=>{
    const {roleId} = req.body;
    if(!roleId) return next(new CustomError("Rol için gerekli parametre gelmedi",400))
    let role =await Role.findById(roleId).select("+employee_permission");
    if(!role) return next(new CustomError("Rol Bulunamadı",400));
    role.role = req.body.role==null?role.role:req.body.role;
    role.userDefault = req.body.userDefault==null?role.userDefault:req.body.userDefault;
    role.isEmployee = req.body.isEmployee==null?role.isEmployee:req.body.isEmployee;
    role.user_permission = req.body.user_permission==null?role.user_permission:req.body.user_permission;
    role.employee_permission = req.body.employee_permission==null?role.employee_permission:req.body.employee_permission;
    role = await role.save();
    res.status(200).json({
        success: true,
        data: role
    })
})

exports.deleteRole = asyncHandler(async(req,res,next)=>{
    const {roleId} = req.body;
    if(!roleId) return next(new CustomError("Rol için gerekli parametre gelmedi",400))
    let role =await Role.findById(roleId)
    if(!role) return next(new CustomError("Rol Bulunamadı",400));
    if(role.userDefault) return next(new CustomError("Silmeden önce ana rol değiştirmeniz gerekmektedir",400));
    const defaultRole = await Role.findOne({userDefault:true});
    const users = await User.find({role:roleId});
    users.forEach(element=>{
        element.role = defaultRole._id;
        element.save();
    })
    if(role.isEmployee){
        const employeeUsers = await User.find({role:roleId});
        employeeUsers.forEach(element=>{
            element.role = defaultRole?defaultRole._id:null
            element.save();
        })
    }
    await Role.findByIdAndDelete(roleId);
    res.status(200).json({
        success : true
    })
})

exports.changeUserDefaultRole = asyncHandler(async(req,res,next)=>{
    const {roleId,allUserChangeStatus} = req.body;
    if(!roleId) return next(new CustomError("Rol için gerekli parametre gelmedi",400))
    let role =await Role.findById(roleId).select("employee_permission");
    if(!role) return next(new CustomError("Rol Bulunamadı",400));
    const oldDefaultRole = await Role.findOne({userDefault: true});
    if(oldDefaultRole){
        oldDefaultRole.userDefault = false;
        await oldDefaultRole.save();
    }
    if(allUserChangeStatus && oldDefaultRole){
        let users = await User.find({role:oldDefaultRole._id});
        users.forEach(element=>{
            element.role = roleId;
            element.save();
        })
    }
    role.userDefault = true;
    role = await role.save();
    res.status(200).json({
        success: true,
        data: role
    })
})