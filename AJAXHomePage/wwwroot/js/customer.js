
(function checkJQuery() {
    if (typeof jQuery !== 'undefined' && typeof jQuery.validator !== 'undefined') {
        initializeCustomerForm();
    } else {
        setTimeout(checkJQuery, 50);
    }
})();

function initializeCustomerForm() {
    console.log('Initializing customer form...');

    $(document).ready(function () {

        $.validator.unobtrusive.parse("#createCustomerForm");


        $.ajaxSetup({
            headers: {
                'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
            }
        });


        $('#countrySelect').change(function () {
            var countryId = $(this).val();
            var citySelect = $('#citySelect');

            if (countryId) {
                citySelect.prop('disabled', true);

                $.getJSON('/Customer/GetCitiesByCountry', { countryId: countryId })
                    .done(function (data) {
                        console.log('Cities loaded:', data);
                        var items = '<option value="">-- Select City --</option>';
                        $.each(data, function (i, city) {
                            items += `<option value="${city.id}">${city.name}</option>`;
                        });
                        citySelect.html(items).prop('disabled', false);
                    })
                    .fail(function (error) {
                        console.error('Error loading cities:', error);
                        citySelect.html('<option value="">Error loading cities</option>');
                    })
                    .always(function () {
                        citySelect.prop('disabled', false);
                    });
            } else {
                citySelect.html('<option value="">-- Select City --</option>').prop('disabled', true);
            }
        });


        $('#createCustomerForm').on('submit', function (e) {
            e.preventDefault();

            $('#citySelect').prop('disabled', false);

            if (!$('#countrySelect').val()) {
                $('[data-valmsg-for="CountryId"]').text('Please select a country');
                return false;
            }

            if (!$('#citySelect').val()) {
                $('[data-valmsg-for="CityId"]').text('Please select a city');
                return false;
            }

            var formData = new FormData(this);

            $.ajax({
                url: $(this).attr('action'),
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    window.location.href = '/Customer/Index';
                },
                error: function (xhr) {
                    if (xhr.responseJSON && xhr.responseJSON.errors) {
                        Object.keys(xhr.responseJSON.errors).forEach(function (key) {
                            $(`[data-valmsg-for="${key}"]`).text(xhr.responseJSON.errors[key]);
                        });
                    } else {
                        alert('Error creating customer. Please try again.');
                    }
                }
            });
        });


        $('#saveCountryBtn').click(function () {
            var formData = {
                Code: $('#countryCode').val(),
                Name: $('#countryName').val()
            };

            $.ajax({
                url: '/Customer/AddCountry',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function (response) {
                    if (response.success) {
                        var newOption = new Option($('#countryName').val(), response.countryId, true, true);
                        $('#countrySelect').append(newOption).trigger('change');
                        $('#cityCountryId').append(newOption.clone());
                        $('#addCountryForm')[0].reset();
                        $('#addCountryModal').modal('hide');
                    }
                }
            });
        });


        $('#saveCityBtn').click(function () {
            var formData = {
                Code: $('#cityCode').val(),
                Name: $('#cityName').val(),
                CountryId: $('#cityCountryId').val()
            };

            $.ajax({
                url: '/Customer/AddCity',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function (response) {
                    if (response.success) {
                        if (formData.CountryId == $('#countrySelect').val()) {
                            var newOption = new Option($('#cityName').val(), response.cityId, true, true);
                            $('#citySelect').append(newOption).trigger('change');
                        }
                        $('#addCityForm')[0].reset();
                        $('#addCityModal').modal('hide');
                    }
                }
            });
        });


        let customerIdToDelete = null;

        window.showDeleteModal = function(id, name) {
            customerIdToDelete = id;
            $('#customerNameToDelete').text(name);
            var modal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
            modal.show();
        }

        $('#confirmDeleteBtn').click(function () {
            if (customerIdToDelete) {
                deleteCustomer(customerIdToDelete);
            }
        });
    });

    function deleteCustomer(customerId) {
        $.ajax({
            url: '/Customer/DeleteConfirmed/' + customerId,
            type: 'POST',
            headers: {
                'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
            },
            success: function (result) {
                if (result.success) {

                    $('#deleteConfirmationModal').modal('hide');


                    setTimeout(function () {
                        window.location.reload();
                    }, 100);
                } else {
                    alert(result.message || 'Error deleting customer');
                    $('#deleteConfirmationModal').modal('hide');
                }
            },
            error: function (xhr, status, error) {
                console.error('Delete error:', error);
                $('#deleteConfirmationModal').modal('hide');


                setTimeout(function () {
                    $.get('/Customer/Exists/' + customerId, function (exists) {
                        if (!exists) {
                            window.location.reload();
                        } else {
                            alert('Error deleting customer. Please try again.');
                        }
                    });
                }, 100);
            }
        });
    }
    // Add Country Modal
    $('#saveCountryBtn').click(function () {
        // Get form data
        var countryCode = $('#countryCode').val();
        var countryName = $('#countryName').val();

        // Validate form
        if (!countryCode || !countryName) {
            alert('Please fill in all fields');
            return;
        }

        var formData = {
            Code: countryCode,
            Name: countryName
        };

        // Disable button to prevent double submission
        $(this).prop('disabled', true);

        $.ajax({
            url: '/Customer/AddCountry',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                if (response.success) {
                    // Add the new country to the dropdown
                    var newOption = new Option(countryName, response.countryId, true, true);
                    $('#countrySelect').append(newOption);
                    $('#cityCountryId').append(newOption.clone());

                    // Reset form and close modal
                    $('#addCountryForm')[0].reset();
                    $('#addCountryModal').modal('hide');

                    // Show success message
                    alert('Country added successfully!');
                } else {
                    alert('Error adding country. Please try again.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                alert('Error adding country. Please try again.');
            },
            complete: function () {
                // Re-enable the button
                $('#saveCountryBtn').prop('disabled', false);
            }
        });
    });

    // Add City Modal
    $('#saveCityBtn').click(function () {
        var formData = {
            Code: $('#cityCode').val(),
            Name: $('#cityName').val(),
            CountryId: $('#cityCountryId').val()
        };

        $.ajax({
            url: '/Customer/AddCity',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                if (response.success) {
                    if (formData.CountryId == $('#countrySelect').val()) {
                        var newOption = new Option($('#cityName').val(), response.cityId, true, true);
                        $('#citySelect').append(newOption).trigger('change');
                    }
                    $('#addCityForm')[0].reset();
                    $('#addCityModal').modal('hide');
                }
            }
        });
    });
}