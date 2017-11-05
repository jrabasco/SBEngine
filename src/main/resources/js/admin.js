var waiting = false;
showdown.setOption('headerLevelStart', 2);
//Extension
showdown.extension('header-anchors', function() {

	var ancTpl = '$1<a id="user-content-$3" class="anchor" href="#$3" aria-hidden="true"><img src="/assets/link.svg" /></a>$4';

  return [{
    type: 'html',
    regex: /(<h([1-4]) id="([^"]+?)">)(.*<\/h\2>)/g,
    replace: ancTpl
  }];
});

function getConverter() {
	return new showdown.Converter({
		  extensions: ['header-anchors']
	});
}

function doLogout() {
    $.ajax({
        type: "GET",
        url: "/api/logout",
        cache: false,
        xhrFields: {
            withCredentials: true
        },
        success: function () {
            window.location.href = "/";
        },
        error: function () {
            alert("Failed logout: retry or contact an administrator.");
        }
    });
}

function deletePost(id, statusId, toHide) {
    var csrfInput = $('input[name="csrf"]');
    var toHideObject = $(toHide);
    var loader = $('.loader');
    if (!waiting && confirm("This will delete the post, are you sure you want to continue?")) {
        hideMessage(statusId + "-error");
        waiting = true;
        toHideObject.hide();
        loader.show();
        $.ajax({
            type: "DELETE",
            url: "/api/posts/" + id,
            cache: false,
            contentType: "application/json",
            headers: {
                'X-Csrf-Protection': csrfInput.val()
            },
            success: function () {
                waiting = false;
                loader.hide();
                showMessage(statusId + "-success", "Deletion successful.");
                setTimeout(function () {
                    postsHome()
                }, 500);
            },
            error: function (resp) {
                waiting = false;
                loader.hide();
                toHideObject.show();
                showMessage(statusId + "-error", "Could not delete post for the following reason: " + resp.responseText);
            }
        });
    }
}

function downloadTrash() {
    if (!waiting) {
        hideMessage("index-error");
        waiting = true;
        $.ajax({
            type: "GET",
            url: "/api/trash",
            cache: false,
            contentType: "application/json",
            success: function (resp) {
                waiting = false;
                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resp, null, 2));
                var dlAnchorElem = $('#downloadAnchorElem')[0];
                dlAnchorElem.setAttribute("href", dataStr);
                dlAnchorElem.setAttribute("download", "deleted.json");
                dlAnchorElem.click();
                dlAnchorElem.removeAttribute("href");
                dlAnchorElem.removeAttribute("download");
            },
            error: function (resp) {
                waiting = false;
                showMessage("index-error", "Could not download deleted posts for the following reason: " + resp.responseText);
            }
        });
    }
}

function purgeTrash() {
    var csrfInput = $('input[name="csrf"]');
    if (!waiting) {
        hideMessage("index-error");
        waiting = true;
        $.ajax({
            type: "DELETE",
            url: "/api/trash",
            cache: false,
            contentType: "application/json",
            headers: {
                'X-Csrf-Protection': csrfInput.val()
            },
            success: function () {
                waiting = false;
                showMessage("posts-index-success", "Deleted posts purged.");
                setTimeout(function () {
                    hideMessage("posts-index-success");
                }, 1000);
            },
            error: function (resp) {
                waiting = false;
                showMessage("posts-index-error", "Could not purge deleted posts for the following reason: " + resp.responseText);
            }
        });
    }
}

function edit(id) {
    window.location.href = "/posts/edit/" + id;
}

function addPost() {
    window.location.href = "/posts/add";
}

function backHome() {
    window.location.href = "/";
}

function postsHome() {
    window.location.href = "/posts"
}

function editAbout() {
    window.location.href = "/perso/edit"
}

function showMessage(divId, message) {
    var errDiv = $("#" + divId);
    errDiv.empty();
    errDiv.text(message);
    errDiv.show();
}

function hideMessage(divId) {
    $("#" + divId).hide();
}

function checkStr(text, minLength) {
    return ((typeof text != "undefined") &&
    (typeof text.valueOf() == "string") &&
    (text.length >= minLength));
}

function doLogin() {
    var form = $('form[name="login"]');
    var loader = $('.loader');
    if (!waiting) {
        hideMessage("login-error");
        waiting = true;
        form.hide();
        loader.show();
        $.ajax
        ({
            type: "POST",
            url: "/api/token",
            dataType: 'json',
            data: '{"username":"' + form[0].username.value + '",' + '"password":"' + form[0].password.value + '"}',
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            contentType: "application/json",
            success: function () {
                waiting = false;
                window.location.reload();
            },
            error: function () {
                waiting = false;
                loader.hide();
                form.show();
                showMessage("login-error", "Password/username combination is incorrect.");
            }
        });
    }
}

function formatForForm(date) {
    var year = date.getFullYear();
    var month = leftPad(date.getMonth() + 1 + '', 2, '0');
    var day = leftPad(date.getDate() + '', 2, '0');
    var hours = leftPad(date.getHours() + '', 2, '0');
    var minutes = leftPad(date.getMinutes() + '', 2, '0');
    return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
}

function leftPad(str, goalLength, padChar) {
    if (str.length < goalLength) {
        return new Array(goalLength - str.length + 1).join(padChar) + str;
    } else {
        return str;
    }
}

function toISOString(date) {
    var resDate = new Date(date);
    var offset = date.getTimezoneOffset();
    resDate.setMinutes(date.getMinutes() + offset);
    return resDate.toISOString();
}

function updateAbout() {
    var form = $('form[name="aboutme-edit"]');
    var loader = $('.loader');
    if (!waiting) {
        hideMessage("form-error");
        waiting = true;
        form.hide();
        loader.show();

        var converter = getConverter();
        var introMarkdown = form[0].intromarkdown.value;
        var introHtml = converter.makeHtml(introMarkdown);

        var resumeMarkdown = form[0].resumemarkdown.value;
        var resumeHtml = converter.makeHtml(resumeMarkdown);

        var aboutMe = {};

        if (checkStr(introMarkdown, 1)) {
            aboutMe["introduction"] = {
                html: introHtml,
                markdown: introMarkdown
            }
        }

        if (checkStr(resumeMarkdown, 1)) {
            aboutMe["resume"] = {
                html: resumeHtml,
                markdown: resumeMarkdown
            }
        }

        $.ajax({
            type: "PUT",
            url: "/api/perso",
            data: JSON.stringify(aboutMe),
            cache: false,
            contentType: "application/json",
            headers: {
                'X-Csrf-Protection': form[0].csrf.value
            },
            success: function () {
                waiting = false;
                loader.hide();
                showMessage("form-success", "Update successful.");
                setTimeout(function () {
                    editAbout();
                }, 500);
            },
            error: function (resp) {
                console.log(resp);
                waiting = false;
                loader.hide();
                form.show();
                showMessage("form-error", "Could not update post for the following reason: " + resp.responseText);
            }
        });
    }
}

function updatePost(add) {
    var form = $('form[name="post-edit"]');
    var loader = $('.loader');
    if (!waiting) {
        hideMessage("form-error");
        waiting = true;
        form.hide();
        loader.show();
        var id = parseInt(form[0].id.value);
        var title = form[0].title.value;
        var summary = form[0].summary.value;

        var converter = getConverter();
        var contentMarkdown = form[0].contentmarkdown.value;
        var contentHtml = converter.makeHtml(contentMarkdown);
        //Assures consistency between firefox and chrome
        var publishedDate = new Date(form[0].publication.value + ":00Z");
        var publishedDateStr = toISOString(publishedDate);

        var post = {
            id: id,
            title: title,
            summary: summary,
            content: {
                html: contentHtml,
                markdown: contentMarkdown
            },
            published: publishedDateStr
        };

        var reqType = add ? "POST" : "PUT";
        var urlEnd = add ? "" : "/" + id;

        $.ajax({
            type: reqType,
            url: "/api/posts" + urlEnd,
            data: JSON.stringify(post),
            cache: false,
            contentType: "application/json",
            headers: {
                'X-Csrf-Protection': form[0].csrf.value
            },
            success: function (resp) {
                waiting = false;
                loader.hide();
                showMessage("form-success", "Update successful.");
                var editId = add ? resp.id : id;
                setTimeout(function () {
                    edit(editId);
                }, 500);
            },
            error: function (resp) {
                console.log(resp);
                waiting = false;
                loader.hide();
                form.show();
                showMessage("form-error", "Could not update post for the following reason: " + resp.responseText);
            }
        });
    }
}

function submitNavbarConf() {
    var form = $('form[name="edit-navbar"]');
    var loader = $('.loader');
    if (!waiting) {
        hideMessage("form-error");
        waiting = true;
        form.hide();
        loader.show();

        var projects = form[0].projects.checked;
        var about = form[0].about.checked;

        var navBarConf = {
            projects: projects,
            about: about
        };

        $.ajax({
            type: "PUT",
            url: "/api/navbar",
            data: JSON.stringify(navBarConf),
            cache: false,
            contentType: "application/json",
            headers: {
                'X-Csrf-Protection': form[0].csrf.value
            },
            success: function () {
                waiting = false;
                loader.hide();
                showMessage("form-success", "Update successful.");
                setTimeout(function () {
                    hideMessage("form-success");
                    form.show();
                }, 500);
            },
            error: function (resp) {
                console.log(resp);
                waiting = false;
                loader.hide();
                form.show();
                showMessage("form-error", "Could not update post for the following reason: " + resp.responseText);
            }
        });
    }
}

function publish(add) {
    if (!waiting && confirm("This will publish the post on the blog.")) {
        var publishDate = new Date();
        $("input[type='datetime-local']").val(formatForForm(publishDate));
        updatePost(add)
    }
}

function showPreview(formName, fillPreview) {
    var form = $('form[name="'+ formName+ '"]');
    var preview = $('.preview');
    var loader = $('.loader');
    form.hide();
    loader.show();

    fillPreview();

    loader.hide();
    preview.show();
}

function fillPostPreview() {
    var form = $('form[name="post-edit"]');
    var preview = $('.preview');
    var title = form[0].title.value;
    var previewPost = $('.preview > .doc');

    var converter = getConverter();
    var contentMarkdown = form[0].contentmarkdown.value;
    var contentHtml = converter.makeHtml(contentMarkdown);

    previewPost.html("<h1>" + title + "</h1>" + contentHtml);
    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });
}

function fillAboutMePreview() {
    var form = $('form[name="aboutme-edit"]');
    var preview = $('.preview');
    var previewIntro = $('.preview > #introduction');
    var previewResume = $('.preview > #resume');

    var converter = getConverter();
    var introMarkdown = form[0].intromarkdown.value;
    var introHtml = converter.makeHtml(introMarkdown);

    var resumeMarkdown = form[0].resumemarkdown.value;
    var resumeHtml = converter.makeHtml(resumeMarkdown);

    previewIntro.html(introHtml);
    previewResume.html(resumeHtml);

    if (checkStr(introMarkdown, 1)) {
        previewIntro.show();
    } else {
        previewIntro.hide();
    }

    if (checkStr(resumeMarkdown, 1)) {
        previewResume.show();
    } else {
        previewResume.hide();
    }

    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });
}

function hidePreview(formName) {
    var form = $('form[name="'+ formName+ '"]');
    var preview = $('.preview');
    preview.hide();
    form.show();
}

function changePassword() {
    var form = $('form[name="edit-password"]');
    var loader = $('.loader');
    if (!waiting) {
        hideMessage("edit-password-error");
        waiting = true;
        form.hide();
        loader.show();
        var oldpassword = form[0].oldpassword.value;
        var newpassword = form[0].newpassword.value;
        var confpassword = form[0].confpassword.value;

        if (!checkStr(newpassword, 10) || !checkStr(confpassword, 10)) {
            showMessage("edit-password-error", "New password is too short (minimum 10 characters).");
            form.show();
            loader.hide();
            waiting = false;
            return;
        }

        if (newpassword != confpassword) {
            showMessage("edit-password-error", "The new password and the confirmation should match.");
            form.show();
            loader.hide();
            waiting = false;
            return;
        }

        var newCredentials = {
            username: form[0].username.value,
            oldPassword: oldpassword,
            newPassword: newpassword
        };

        $.ajax
        ({
            type: "POST",
            url: "/api/new_password",
            data: JSON.stringify(newCredentials),
            cache: false,
            contentType: "application/json",
            headers: {
                'X-Csrf-Protection': form[0].csrf.value
            },
            success: function () {
                waiting = false;
                loader.hide();
                form.show();
                resetFields("edit-password", "edit-password-error");
                showMessage("edit-password-success", "Update successful.");
                setTimeout(function () {
                    hideMessage("edit-password-success");
                }, 1000);
            },
            error: function () {
                waiting = false;
                loader.hide();
                form.show();
                showMessage("edit-password-error", "Old password is incorrect.");
            }
        });
    }
}

function resetFields(formName, errorId) {
    hideMessage(errorId);
    var form = $('form[name="' + formName + '"]');
    form.find('input[type=password], input[type=text]').each(function () {
        var inputField = $(this);
        inputField.val("");
        inputField.removeClass("ok");
        inputField.addClass("not-ok");
    });
}
