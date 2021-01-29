const baseUrl = 'http://localhost:3001';

$(document).ready(function () {
    $('#searchBtn').on("click", () => {
        const title = $('#title').val();
        const url = `${baseUrl}/api/v1/thesis/search?title=${title.trim()}`;
        $.ajax({
            url: url,
            type: 'GET',
            success: (data) => {
                console.log('result":', data)
                $('#thesisList').empty();
                $.each(data.thesis, (i, value) => {
                    $('#thesisList')
                            .append(`
                                    <li class="media-bullet  border-dark">
                                    <p class="card-text">${value._source.title} (${value._id})</p>
                                   </li>`)
                });
            },
        });
    })
})
