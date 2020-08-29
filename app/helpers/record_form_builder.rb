class RecordFormBuilder < ActionView::Helpers::FormBuilder
  def date_picker_field(attribute, options = {})
    @template.render partial: 'shared/date_picker', locals: {
      form: self,
      attribute: attribute,
      time: false,
      options: options
    }
  end

  def date_time_picker_field(attribute, options = {})
    @template.render partial: 'shared/date_picker', locals: {
      form: self,
      attribute: attribute,
      time: true,
      options: options
    }
  end
end
