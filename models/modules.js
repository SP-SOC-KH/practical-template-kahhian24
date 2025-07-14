const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();



module.exports.create = function create(code, name, credit) {
    return prisma.module.create({
        // TODO: Add data
        data: {
            mod_code: code,
            mod_name: name,
            credit_unit: parseInt(credit, 10)
        }
    }).then(function (module) {
        // TODO: Return module
        return module;
    }).catch(function (error) {
        // Prisma error codes:
        // https://www.prisma.io/docs/orm/reference/error-reference#p2002
        // TODO: Handle Prisma Error, throw a new error if module already exists
        if (error.code === 'P2002') {
            throw new Error(`Module ${code} already exists! Cannot create duplicate.`);
        }
        throw error;
    });
};

module.exports.update = function update(code, credit) {
    return prisma.module.update({
        // TODO: Add where and data
        where: {
            mod_code: code
        },
        data: {
            credit_unit: parseInt(credit, 10)
        }
    }).then(function (module) {
        // Leave blank
    }).catch(function (error) {
        // Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference#p2025
        // TODO: Handle Prisma Error, throw a new error if module is not found
        if (error.code === 'P2025') {
            throw new Error(`Module ${code} not found! Cannot update non-existing module.`);
        }
        throw error;
    });
};

module.exports.del = function del(code) {
    return prisma.module.delete({
        // TODO: Add where
        where: {
            mod_code: code
        }
    }).then(function (module) {
        // Leave blank
    }).catch(function (error) {
        // Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference#p2025
        // TODO: Handle Prisma Error, throw a new error if module is not found
        if (error.code === 'P2025') {
            throw new Error(`Module ${code} not found! Cannot delete non-existing module.`);
        }
    })
};

module.exports.retrieveAll = function retrieveAll() {
    // TODO: Return all modules
    return prisma.module.findMany().then(function (modules) {
        // Map database column names to expected property names
        return modules.map(function (module) {
            return {
                modCode: module.mod_code,
                modName: module.mod_name,
                creditUnit: module.credit_unit
            };
        });
    });
};

module.exports.retrieveByCode = function retrieveByCode(code) {
    return prisma.module.findUnique({
        where: {
            mod_code: code
        }
    }).then(function (module) {
        // TODO: Return the module if found, otherwise throw an error
        if (!module) {
            throw new Error(`Module ${code} not found!`);
        }
        // Map database column names to expected property names
        return {
            modCode: module.mod_code,
            modName: module.mod_name,
            creditUnit: module.credit_unit
        };
    }).catch(function (error) {
        // Only handle Prisma errors, not our custom errors
        if (error.code === 'P2025') {
            throw new Error(`Module ${code} not found!`);
        }
        // Re-throw any other errors (including our custom "not found" error)
        throw error;
    });
}