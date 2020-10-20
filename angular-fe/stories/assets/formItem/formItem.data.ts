export const formItems = {
  text: {
    type: 'text',
    title: 'Text field',
    errorMessage: 'Please fill this field!',
  },
  textDisabledTitle: {
    type: 'text',
    titleDisabled: 'true',
    placeholder: 'Text field with disabled title',
    errorMessage: 'Please fill this field!',
  },
  textarea: {
    type: 'textarea',
    title: 'Textarea',
    value: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
    errorMessage: 'Please fill this field!',
  },
  number: {
    type: 'number',
    title: 'Number field',
    errorMessage: 'Please fill this field!',
  },
  date: {
    type: 'date',
    title: 'Datepicker',
    errorMessage: 'Wrong date format!',
    placeholder: 'aaaa-kk-pp',
  },
  multiselect: {
    type: 'multi-select',
    title: 'Multiselect',
    options: [
      {
        key: 'Option 1',
        value: '1',
      },
      {
        key: 'Option 2',
        value: '2',
      },
      {
        key: 'Option 3',
        value: '3',
      },
      {
        key: 'Option 4',
        value: '4',
      },
      {
        key: 'Option 5',
        value: '5',
      },
      {
        key: 'Option 6',
        value: '6',
      },
    ],
    errorMessage: 'Please select at least 1 value!',
  },
  select: {
    type: 'select',
    title: 'Select',
    options: [
      {
        key: 'Select an option',
        value: '',
      },
      {
        key: 'Option 1',
        value: '1',
      },
      {
        key: 'Option 2',
        value: '2',
      },
      {
        key: 'Option 3',
        value: '3',
      },
      {
        key: 'Option 4',
        value: '4',
      },
    ],
    errorMessage: 'This field is required!',
  },
  checkbox: {
    type: 'checkbox',
    label: 'Option',
    errorMessage: 'You MUST agree to our terms!',
  },
  radio: {
    type: 'radio',
    title: 'Radiobuttons',
    options: [
      {
        key: 'Option 1',
        value: '1',
      },
      {
        key: 'Option 2',
        value: '2',
      },
      {
        key: 'Option 3',
        value: '3',
      },
      {
        key: 'Option 4',
        value: '4',
      },
    ],
    errorMessage: 'Select at least 1 option!',
  },
};
