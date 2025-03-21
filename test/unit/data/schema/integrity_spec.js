const should = require('should');
const _ = require('lodash');
const yaml = require('js-yaml');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const {config} = require('../../../utils/configUtils');
const schema = require('../../../../core/server/data/schema');
const fixtures = require('../../../../core/server/data/schema/fixtures');
const frontendSettings = require('../../../../core/frontend/services/settings');
const validateFrontendSettings = require('../../../../core/frontend/services/settings/validate');
const defaultSettings = require('../../../../core/server/data/schema/default-settings');

/**
 * @NOTE
 *
 * If this test fails for you, you have modified one of:
 * - the database schema
 * - fixtures
 * - default settings
 * - routes.yaml
 *
 * When you make a change, please test that:
 *
 * 1. A new blog get's installed and the database looks correct and complete.
 * 2. A blog get's updated from a lower Ghost version and the database looks correct and complete.
 *
 * Typical cases:
 * You have to add a migration script if you've added/modified permissions.
 * You have to add a migration script if you've add a new table.
 * You have to add a migration script if you've added new settings to populate group/flags column.
 */
describe('DB version integrity', function () {
    // Only these variables should need updating
    const currentSchemaHash = 'b7bca80554f3946cd2f83e0e99ff3532';
    const currentFixturesHash = 'b24801cf9f819e4c127316021877ad70';
    const currentSettingsHash = 'b943cc3956eee3dd042f8394b2701d21';
    const currentRoutesHash = '3d180d52c663d173a6be791ef411ed01';

    // If this test is failing, then it is likely a change has been made that requires a DB version bump,
    // and the values above will need updating as confirmation
    it('should not change without fixing this test', function () {
        const routesPath = path.join(config.get('paths').defaultSettings, 'default-routes.yaml');
        const defaultRoutes = validateFrontendSettings(yaml.load(fs.readFileSync(routesPath, 'utf-8')));

        const tablesNoValidation = _.cloneDeep(schema.tables);
        let schemaHash;
        let fixturesHash;
        let settingsHash;
        let routesHash;

        _.each(tablesNoValidation, function (table) {
            return _.each(table, function (column, name) {
                table[name] = _.omit(column, 'validations');
            });
        });

        schemaHash = crypto.createHash('md5').update(JSON.stringify(tablesNoValidation), 'binary').digest('hex');
        fixturesHash = crypto.createHash('md5').update(JSON.stringify(fixtures), 'binary').digest('hex');
        settingsHash = crypto.createHash('md5').update(JSON.stringify(defaultSettings), 'binary').digest('hex');
        routesHash = crypto.createHash('md5').update(JSON.stringify(defaultRoutes), 'binary').digest('hex');

        schemaHash.should.eql(currentSchemaHash);
        fixturesHash.should.eql(currentFixturesHash);
        settingsHash.should.eql(currentSettingsHash);
        routesHash.should.eql(currentRoutesHash);
        routesHash.should.eql(frontendSettings.getDefaulHash('routes'));
    });
});
