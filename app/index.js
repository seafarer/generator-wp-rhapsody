'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var slug = require('slug')


var wpRhapsodyTheme = module.exports = function wpRhapsodyTheme(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.runInstall('yarn');
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(wpRhapsodyTheme, yeoman.generators.Base);

wpRhapsodyTheme.prototype.askFor = function askFor() {

  var done = this.async();

  // Have Yeoman greet the user.
  this.log(yosay(
    'Welcome to the ' + chalk.red('Wordpress Rhapsody Theme') + ' generator!'
  ));

  var prompts = [
    {
      name: 'themeName',
      message: 'What is the name of your theme?',
      default: 'rhapsody'
    },
    {
      name: 'themeNameSpace',
      message: 'Unique name-space for the theme (alphanumeric)? Best to keep it short',
      default: function (answers) {
        return answers.themeName.replace(/\W/g, '').toLowerCase();
      }
    },
    {
      name: 'themeAuthor',
      message: 'Name of the theme author?',
      default: 'Colin OBrien'
    },
    {
      name: 'themeAuthorURI',
      message: 'Website of the themes authors?',
      default: 'http://www.develody.io'
    },
    {
      name: 'themeURI',
      message: 'Website of the theme?',
      default: function (answers) {
        return answers.themeAuthorURI + '/'+ answers.themeName;
      }
    },
    {
      name: 'themeDescription',
      message: 'Description of the theme?',
      default: function (answers) {
        return 'A custom theme for ' + answers.themeName + ' handcrafted by Develody';
      }
    }
  ];

  this.prompt(prompts, function (props) {
    this.themeName = props.themeName;
    this.themeNameSpace = props.themeNameSpace;
    this.themeAuthor = props.themeAuthor;
    this.themeAuthorURI = props.themeAuthorURI;
    this.themeURI = props.themeURI;
    this.themeDescription = props.themeDescription;

    done();
  }.bind(this));
};

wpRhapsodyTheme.prototype.installRhapsody = function installRhapsody() {
  this.startertheme = 'https://github.com/seafarer/rhapsody/archive/master.tar.gz';
  this.log.info('Downloading & extracting ' + chalk.yellow('Rhapsody'));
  this.tarball(this.startertheme, '.', this.async());
};

function findandreplace(dir) {
  var self = this;

  var files = fs.readdirSync(dir);
  files.forEach(function (file) {
    file = path.join(dir, file);
    var stat = fs.statSync(file);

    if (stat.isFile() && (path.extname(file) === '.php' || path.extname(file) === '.scss')) {
      self.log.info('Find and replace rhapsody shit in ' + chalk.yellow(file));
      var data = fs.readFileSync(file, 'utf8');
      var result;
      result = data.replace(/Text Domain: rhapsody/g, "Text Domain: " + slug(self.themeNameSpace) + "");
      result = result.replace(/'rhapsody'/g, "'" + slug(self.themeNameSpace) + "'");
      result = result.replace(/rhapsody_/g, slug(self.themeNameSpace) + "_");
      result = result.replace(/ rhapsody/g, " " + slug(self.themeNameSpace));
      result = result.replace(/rhapsody-/g, slug(self.themeNameSpace) + "-");
      if (file === 'sass/style.scss') {
        self.log.info('Style.scss found! Updating theme information in ' + file);
        result = result.replace(/(Theme Name: )(.+)/g, '$1' + self.themeName);
        result = result.replace(/(Theme URI: )(.+)/g, '$1' + self.themeURI);
        result = result.replace(/(Author: )(.+)/g, '$1' + self.themeAuthor);
        result = result.replace(/(Author URI: )(.+)/g, '$1' + self.themeAuthorURI);
        result = result.replace(/(Description: )(.+)/g, '$1' + self.themeDescription);
        result = result.replace(/(Text Domain: )(.+)/g, '$1' + self.themeNameSpace);
      }
      else if (file === 'footer.php') {
        self.log.info('Updating theme information in ' + file);
        result = result.replace(/http:\/\/automattic.com\//g, self.authorURI);
        result = result.replace(/Automattic/g, self.themeAuthor);
      }
      fs.writeFileSync(file, result, 'utf8');
    }
    else if (stat.isFile() && path.basename(file) == 'rhapsody.pot') {
      self.log.info('Renaming language file ' + chalk.yellow(file));
      fs.renameSync(file, path.join(path.dirname(file), slug(self.themeName) + '.pot'));
    }
    else if (stat.isFile() && path.basename(file) == 'README.md') {
      self.log.info('Updating ' + chalk.yellow(file));
      var data = fs.readFileSync(file, 'utf8');
      var result = data.replace(/((.|\n)*)Getting Started(.|\n)*/i, '$1');
      fs.writeFileSync(file, result, 'utf8');
    }
    else if (stat.isDirectory()) {
      findandreplace.call(self, file);
    }
  });
}

wpRhapsodyTheme.prototype.renameunderscores = function renameunderscores() {
  findandreplace.call(this, '.');
  this.log.ok('Done replacing string ' + chalk.yellow('Rhapsody'));
};

wpRhapsodyTheme.prototype.app = function () {
  var currentDate = new Date();
  this.themeCreated = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
};
