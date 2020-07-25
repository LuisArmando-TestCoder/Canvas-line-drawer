function template(string, reject = {
    styles: true,
    scripts: true
}) {
    const fakeParent = document.createElement('div');
    let childClone;
    let styles;
    let scripts;

    fakeParent.innerHTML = string;
    childClone = fakeParent.children[0];

    styles = [...childClone.querySelectorAll('style')];
    scripts = [...childClone.querySelectorAll('script')];

    if (reject.styles) styles.forEach(element => element.remove());
    if (reject.scripts) scripts.forEach(element => element.remove());

    fakeParent.remove();
    return childClone;
}

export default template