window.StatisticsView = Backbone.View.extend({
    events: {},

    //Class Initializer
    initialize: function () {
        this.data = this.collection.toJSON();
    },

    //Class Renderer
    render: function () {
        var self = this;
        $(this.el).html(this.template({collection: self.data}));

        return this;
    }

});