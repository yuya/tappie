matchdep  = require "matchdep"
copyright = "// <%= pkg.title %> <%= pkg.version %> " +
            "Copyright (C) #{new Date().getFullYear()} <%= pkg.author %>, " +
            "<%= pkg.license %> License.\n" +
            "// See <%= pkg.url %>\n"

module.exports = (grunt) ->
  config =
    pkg: grunt.file.readJSON "package.json"

    uglify:
      dist:
        options:
          mangle: true
          banner: copyright
        files:
          "<%= pkg.name %>.min.js": ["<%= pkg.name %>.js"]

    esteWatch:
      options:
        dirs: ["."]
        livereload:
          enabled: false
      js: ->
        return ["jshint", "uglify"]

    jshint:
      src: ["<%= pkg.name %>.js"]
      options: do ->
        ret = { globals: {} }
        opt = [
          "curly"    # ループブロックと条件ブロックを常に中括弧で囲うことを強制
          "eqeqeq"
          "eqnull"
          "immed"
          "latedef"
          "undef"
          "unused"
          "trailing" # 行末のホワイトスペースを禁止
          "browser"
          "devel"
        ]

        for o in opt then ret[o] = true
        opt["maxlen"]            = 120

        return ret

  grunt.initConfig config
  matchdep.filterDev("grunt-*").forEach grunt.loadNpmTasks

  grunt.registerTask "default", "esteWatch"
